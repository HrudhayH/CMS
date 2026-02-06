const PaymentPlan = require('../models/PaymentPlan');
const PaymentPhase = require('../models/PaymentPhase');
const PaymentHistory = require('../models/PaymentHistory');
const Project = require('../models/Project');

// Create payment plan for a project
const createPaymentPlan = async (req, res) => {
  try {
    const { clientId, projectId, totalAmount, paymentType, phases } = req.body;

    if (!clientId || !projectId || !totalAmount || !paymentType) {
      return res.status(400).json({ success: false, message: 'Client, project, total amount, and payment type are required.' });
    }

    // Check if plan already exists for this project
    const existingPlan = await PaymentPlan.findOne({ project: projectId });
    if (existingPlan) {
      return res.status(400).json({ success: false, message: 'Payment plan already exists for this project.' });
    }

    // Verify project exists and belongs to client
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const plan = await PaymentPlan.create({
      client: clientId,
      project: projectId,
      totalAmount,
      paymentType
    });

    // If phase-wise, create phases
    if (paymentType === 'PHASE_WISE' && phases && phases.length > 0) {
      const phaseDocuments = phases.map(phase => {
        const calculatedAmount = phase.amountType === 'PERCENTAGE'
          ? (totalAmount * phase.amountValue) / 100
          : phase.amountValue;

        return {
          paymentPlan: plan._id,
          phaseName: phase.phaseName,
          amountType: phase.amountType,
          amountValue: phase.amountValue,
          calculatedAmount,
          dueDate: phase.dueDate || null
        };
      });

      await PaymentPhase.insertMany(phaseDocuments);
    }

    const populatedPlan = await PaymentPlan.findById(plan._id)
      .populate('client', 'name email')
      .populate('project', 'title');

    res.status(201).json({ success: true, message: 'Payment plan created.', data: populatedPlan });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// Get all payment plans (paginated)
const getPaymentPlans = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [plans, total] = await Promise.all([
      PaymentPlan.find()
        .populate('client', 'name email')
        .populate('project', 'title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean({ virtuals: true }),
      PaymentPlan.countDocuments()
    ]);

    res.json({
      success: true,
      data: plans,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// Get payment plan by ID with phases
const getPaymentPlan = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await PaymentPlan.findById(id)
      .populate('client', 'name email')
      .populate('project', 'title')
      .lean({ virtuals: true });

    if (!plan) {
      return res.status(404).json({ success: false, message: 'Payment plan not found.' });
    }

    const phases = await PaymentPhase.find({ paymentPlan: id }).sort({ createdAt: 1 }).lean();

    res.json({ success: true, data: { ...plan, phases } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// Get payments by client
const getPaymentsByClient = async (req, res) => {
  try {
    const { clientId } = req.params;

    const plans = await PaymentPlan.find({ client: clientId })
      .populate('project', 'title')
      .lean({ virtuals: true });

    res.json({ success: true, data: plans });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// Get payment by project
const getPaymentByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const plan = await PaymentPlan.findOne({ project: projectId })
      .populate('client', 'name email')
      .populate('project', 'title')
      .lean({ virtuals: true });

    if (!plan) {
      return res.status(404).json({ success: false, message: 'No payment plan found for this project.' });
    }

    const phases = await PaymentPhase.find({ paymentPlan: plan._id }).sort({ createdAt: 1 }).lean();

    res.json({ success: true, data: { ...plan, phases } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// Mark phase as paid
const markPhaseAsPaid = async (req, res) => {
  try {
    const { id, phaseId } = req.params;
    const { paymentMode } = req.body;

    if (!paymentMode) {
      return res.status(400).json({ success: false, message: 'Payment mode is required.' });
    }

    const phase = await PaymentPhase.findOne({ _id: phaseId, paymentPlan: id });
    if (!phase) {
      return res.status(404).json({ success: false, message: 'Phase not found.' });
    }

    if (phase.status === 'PAID') {
      return res.status(400).json({ success: false, message: 'Phase is already paid.' });
    }

    const plan = await PaymentPlan.findById(id);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Payment plan not found.' });
    }

    // Update phase
    phase.status = 'PAID';
    phase.paidDate = new Date();
    phase.paymentMode = paymentMode;
    await phase.save();

    // Update plan totals
    plan.totalPaidAmount += phase.calculatedAmount;
    plan.status = plan.totalPaidAmount >= plan.totalAmount ? 'PAID' : 'PARTIAL';
    await plan.save();

    // Create history entry
    await PaymentHistory.create({
      client: plan.client,
      project: plan.project,
      paymentPlan: plan._id,
      phaseName: phase.phaseName,
      amount: phase.calculatedAmount,
      paymentMode,
      paidDate: new Date(),
      createdBy: req.user.id
    });

    res.json({ success: true, message: 'Phase marked as paid.', data: phase });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// Mark full payment (ONE_TIME)
const markFullPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMode } = req.body;

    if (!paymentMode) {
      return res.status(400).json({ success: false, message: 'Payment mode is required.' });
    }

    const plan = await PaymentPlan.findById(id);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Payment plan not found.' });
    }

    if (plan.status === 'PAID') {
      return res.status(400).json({ success: false, message: 'Payment is already completed.' });
    }

    if (plan.paymentType !== 'ONE_TIME') {
      return res.status(400).json({ success: false, message: 'Use phase payment for phase-wise plans.' });
    }

    plan.totalPaidAmount = plan.totalAmount;
    plan.status = 'PAID';
    await plan.save();

    await PaymentHistory.create({
      client: plan.client,
      project: plan.project,
      paymentPlan: plan._id,
      phaseName: 'FULL_PAYMENT',
      amount: plan.totalAmount,
      paymentMode,
      paidDate: new Date(),
      createdBy: req.user.id
    });

    res.json({ success: true, message: 'Full payment recorded.', data: plan });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// Get global payment history (paginated)
const getPaymentHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [history, total] = await Promise.all([
      PaymentHistory.find()
        .populate('client', 'name email')
        .populate('project', 'title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      PaymentHistory.countDocuments()
    ]);

    res.json({
      success: true,
      data: history,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// Add phases to existing plan
const addPhases = async (req, res) => {
  try {
    const { id } = req.params;
    const { phases } = req.body;

    if (!phases || phases.length === 0) {
      return res.status(400).json({ success: false, message: 'Phases are required.' });
    }

    const plan = await PaymentPlan.findById(id);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Payment plan not found.' });
    }

    if (plan.paymentType !== 'PHASE_WISE') {
      return res.status(400).json({ success: false, message: 'Cannot add phases to one-time payment plan.' });
    }

    const phaseDocuments = phases.map(phase => {
      const calculatedAmount = phase.amountType === 'PERCENTAGE'
        ? (plan.totalAmount * phase.amountValue) / 100
        : phase.amountValue;

      return {
        paymentPlan: plan._id,
        phaseName: phase.phaseName,
        amountType: phase.amountType,
        amountValue: phase.amountValue,
        calculatedAmount,
        dueDate: phase.dueDate || null
      };
    });

    const createdPhases = await PaymentPhase.insertMany(phaseDocuments);

    res.status(201).json({ success: true, message: 'Phases added.', data: createdPhases });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// Edit payment plan (totalAmount, paymentType)
const updatePaymentPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { totalAmount, paymentType } = req.body;

    const plan = await PaymentPlan.findById(id);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Payment plan not found.' });
    }

    // Get existing phases
    const phases = await PaymentPhase.find({ paymentPlan: id });
    const paidPhases = phases.filter(p => p.status === 'PAID');
    const hasPaidPhases = paidPhases.length > 0;

    // Validate payment type change
    if (paymentType && paymentType !== plan.paymentType) {
      if (plan.paymentType === 'PHASE_WISE' && paymentType === 'ONE_TIME') {
        if (hasPaidPhases) {
          return res.status(400).json({ 
            success: false, 
            message: 'Cannot switch to ONE_TIME when phases are already paid.' 
          });
        }
        // Delete all pending phases when switching to ONE_TIME
        await PaymentPhase.deleteMany({ paymentPlan: id, status: 'PENDING' });
      }
      if (plan.paymentType === 'ONE_TIME' && paymentType === 'PHASE_WISE') {
        if (plan.status === 'PAID') {
          return res.status(400).json({ 
            success: false, 
            message: 'Cannot switch to PHASE_WISE when payment is already completed.' 
          });
        }
      }
      plan.paymentType = paymentType;
    }

    // Update total amount
    if (totalAmount !== undefined && totalAmount !== plan.totalAmount) {
      if (totalAmount < plan.totalPaidAmount) {
        return res.status(400).json({ 
          success: false, 
          message: `Total amount cannot be less than already paid amount (${plan.totalPaidAmount}).` 
        });
      }
      plan.totalAmount = totalAmount;

      // Recalculate pending phases with PERCENTAGE type
      const pendingPhases = await PaymentPhase.find({ paymentPlan: id, status: 'PENDING' });
      for (const phase of pendingPhases) {
        if (phase.amountType === 'PERCENTAGE') {
          phase.calculatedAmount = (totalAmount * phase.amountValue) / 100;
          await phase.save();
        }
      }
    }

    // Recalculate status
    if (plan.totalPaidAmount >= plan.totalAmount) {
      plan.status = 'PAID';
    } else if (plan.totalPaidAmount > 0) {
      plan.status = 'PARTIAL';
    } else {
      plan.status = 'PENDING';
    }

    await plan.save();

    const updatedPlan = await PaymentPlan.findById(id)
      .populate('client', 'name email')
      .populate('project', 'title')
      .lean({ virtuals: true });

    const updatedPhases = await PaymentPhase.find({ paymentPlan: id }).sort({ createdAt: 1 }).lean();

    res.json({ success: true, message: 'Payment plan updated.', data: { ...updatedPlan, phases: updatedPhases } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// Edit phase (only if PENDING)
const updatePhase = async (req, res) => {
  try {
    const { id, phaseId } = req.params;
    const { phaseName, amountType, amountValue, dueDate } = req.body;

    const phase = await PaymentPhase.findOne({ _id: phaseId, paymentPlan: id });
    if (!phase) {
      return res.status(404).json({ success: false, message: 'Phase not found.' });
    }

    if (phase.status === 'PAID') {
      return res.status(400).json({ success: false, message: 'Cannot edit a paid phase.' });
    }

    const plan = await PaymentPlan.findById(id);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Payment plan not found.' });
    }

    // Update fields
    if (phaseName !== undefined) phase.phaseName = phaseName;
    if (dueDate !== undefined) phase.dueDate = dueDate || null;

    // Update amount if changed
    if (amountType !== undefined || amountValue !== undefined) {
      const newAmountType = amountType !== undefined ? amountType : phase.amountType;
      const newAmountValue = amountValue !== undefined ? amountValue : phase.amountValue;

      phase.amountType = newAmountType;
      phase.amountValue = newAmountValue;
      phase.calculatedAmount = newAmountType === 'PERCENTAGE'
        ? (plan.totalAmount * newAmountValue) / 100
        : newAmountValue;
    }

    await phase.save();

    res.json({ success: true, message: 'Phase updated.', data: phase });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

// Delete phase (only if PENDING)
const deletePhase = async (req, res) => {
  try {
    const { id, phaseId } = req.params;

    const phase = await PaymentPhase.findOne({ _id: phaseId, paymentPlan: id });
    if (!phase) {
      return res.status(404).json({ success: false, message: 'Phase not found.' });
    }

    if (phase.status === 'PAID') {
      return res.status(400).json({ success: false, message: 'Cannot delete a paid phase.' });
    }

    await PaymentPhase.deleteOne({ _id: phaseId });

    res.json({ success: true, message: 'Phase deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.', error: error.message });
  }
};

module.exports = {
  createPaymentPlan,
  getPaymentPlans,
  getPaymentPlan,
  getPaymentsByClient,
  getPaymentByProject,
  markPhaseAsPaid,
  markFullPayment,
  getPaymentHistory,
  addPhases,
  updatePaymentPlan,
  updatePhase,
  deletePhase
};
