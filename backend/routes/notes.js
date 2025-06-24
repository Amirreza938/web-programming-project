const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Note = require('../models/Note');
const Ad = require('../models/Ad');

// GET /api/notes - List notes on ads
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const notes = await Note.find({ user: req.user.id })
      .populate({
        path: 'ad',
        populate: {
          path: 'owner',
          select: 'firstName lastName avatar city'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Note.countDocuments({ user: req.user.id });

    // Filter out notes with deleted ads
    const validNotes = notes.filter(note => note.ad);

    res.json({
      success: true,
      notes: validNotes,
      pagination: {
        current: Number(page),
        total: Math.ceil(total / limit),
        count: validNotes.length,
        totalCount: total
      }
    });
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/notes - Add a note
router.post('/', [
  body('adId').notEmpty().withMessage('Ad ID is required'),
  body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Note content is required and must be under 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { adId, content } = req.body;

    // Check if ad exists
    const ad = await Ad.findById(adId);
    if (!ad) {
      return res.status(404).json({ success: false, message: 'Ad not found' });
    }

    // Create or update note
    let note = await Note.findOne({ user: req.user.id, ad: adId });
    
    if (note) {
      note.content = content;
      await note.save();
    } else {
      note = new Note({
        user: req.user.id,
        ad: adId,
        content
      });
      await note.save();
    }

    await note.populate({
      path: 'ad',
      populate: {
        path: 'owner',
        select: 'firstName lastName avatar city'
      }
    });

    res.status(201).json({ success: true, note });
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/notes/:id - Edit a note
router.put('/:id', [
  body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Note content is required and must be under 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const note = await Note.findOne({ _id: req.params.id, user: req.user.id });

    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    note.content = req.body.content;
    await note.save();
    await note.populate({
      path: 'ad',
      populate: {
        path: 'owner',
        select: 'firstName lastName avatar city'
      }
    });

    res.json({ success: true, note });
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/notes/:id - Delete a note
router.delete('/:id', async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user.id });

    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    res.json({ success: true, message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/notes/ad/:adId - Get note for specific ad
router.get('/ad/:adId', async (req, res) => {
  try {
    const note = await Note.findOne({ user: req.user.id, ad: req.params.adId })
      .populate({
        path: 'ad',
        populate: {
          path: 'owner',
          select: 'firstName lastName avatar city'
        }
      });

    res.json({ success: true, note });
  } catch (error) {
    console.error('Error fetching note:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
