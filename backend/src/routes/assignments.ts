// ============================================
// ASSIGNMENT ROUTES - Tasks/Homework management
// ============================================

import { Hono } from 'hono';
import {
  createAssignment,
  getAssignmentById,
  getAllAssignments,
  updateAssignment,
  deleteAssignment,
  getAssignmentsForUser,
  createSubmission,
  getSubmissionsByAssignment,
  getSubmissionsByUser,
  updateSubmission,
  getSubmissionById,
  getUserById,
} from '../db/queries';

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

const assignments = new Hono<{ Bindings: Bindings }>();

// ============================================
// TEACHER ROUTES
// ============================================

// POST /assignments - Create new assignment (Teacher only)
assignments.post('/', async (c) => {
  try {
    const user = c.get('user');

    if (user.role !== 'teacher') {
      return c.json({ success: false, error: 'Only teachers can create assignments' }, 403);
    }

    const body = await c.req.json();
    const {
      title,
      description,
      type,
      difficulty,
      points,
      max_attempts,
      time_limit_minutes,
      config,
      due_date,
      assigned_to,
    } = body;

    // Validation
    if (!title || !type) {
      return c.json({ success: false, error: 'Title and type are required' }, 400);
    }

    const validTypes = ['vocabulary', 'quiz', 'writing', 'listening', 'game'];
    if (!validTypes.includes(type)) {
      return c.json({ success: false, error: 'Invalid assignment type' }, 400);
    }

    // Create assignment
    const assignment = await createAssignment(c.env.DB, {
      title,
      description,
      type,
      difficulty: difficulty || 'beginner',
      points: points || 10,
      max_attempts: max_attempts || 3,
      time_limit_minutes,
      config,
      due_date,
      assigned_to: assigned_to || 'all',
      created_by: user.id,
    });

    if (!assignment) {
      return c.json({ success: false, error: 'Failed to create assignment' }, 500);
    }

    return c.json(
      {
        success: true,
        data: {
          assignment,
          message: 'Assignment created successfully',
        },
      },
      201
    );
  } catch (error) {
    console.error('Create assignment error:', error);
    return c.json({ success: false, error: 'Failed to create assignment' }, 500);
  }
});

// GET /assignments - Get all assignments (Teacher: all, Student: assigned to them)
assignments.get('/', async (c) => {
  try {
    const user = c.get('user');

    if (user.role === 'teacher') {
      // Teachers see all assignments
      const allAssignments = await getAllAssignments(c.env.DB);
      return c.json({ success: true, data: allAssignments });
    } else {
      // Students see only assignments assigned to them
      const userAssignments = await getAssignmentsForUser(c.env.DB, user.id, user.student_group);
      return c.json({ success: true, data: userAssignments });
    }
  } catch (error) {
    console.error('Get assignments error:', error);
    return c.json({ success: false, error: 'Failed to fetch assignments' }, 500);
  }
});

// GET /assignments/:id - Get single assignment
assignments.get('/:id', async (c) => {
  try {
    const assignmentId = parseInt(c.req.param('id'));

    if (isNaN(assignmentId)) {
      return c.json({ success: false, error: 'Invalid assignment ID' }, 400);
    }

    const assignment = await getAssignmentById(c.env.DB, assignmentId);

    if (!assignment) {
      return c.json({ success: false, error: 'Assignment not found' }, 404);
    }

    return c.json({ success: true, data: assignment });
  } catch (error) {
    console.error('Get assignment error:', error);
    return c.json({ success: false, error: 'Failed to fetch assignment' }, 500);
  }
});

// PUT /assignments/:id - Update assignment (Teacher only)
assignments.put('/:id', async (c) => {
  try {
    const user = c.get('user');

    if (user.role !== 'teacher') {
      return c.json({ success: false, error: 'Only teachers can update assignments' }, 403);
    }

    const assignmentId = parseInt(c.req.param('id'));
    const body = await c.req.json();

    if (isNaN(assignmentId)) {
      return c.json({ success: false, error: 'Invalid assignment ID' }, 400);
    }

    const assignment = await getAssignmentById(c.env.DB, assignmentId);

    if (!assignment) {
      return c.json({ success: false, error: 'Assignment not found' }, 404);
    }

    // Update assignment
    const updatedAssignment = await updateAssignment(c.env.DB, assignmentId, body);

    if (!updatedAssignment) {
      return c.json({ success: false, error: 'Failed to update assignment' }, 500);
    }

    return c.json({
      success: true,
      data: {
        assignment: updatedAssignment,
        message: 'Assignment updated successfully',
      },
    });
  } catch (error) {
    console.error('Update assignment error:', error);
    return c.json({ success: false, error: 'Failed to update assignment' }, 500);
  }
});

// DELETE /assignments/:id - Delete assignment (Teacher only)
assignments.delete('/:id', async (c) => {
  try {
    const user = c.get('user');

    if (user.role !== 'teacher') {
      return c.json({ success: false, error: 'Only teachers can delete assignments' }, 403);
    }

    const assignmentId = parseInt(c.req.param('id'));

    if (isNaN(assignmentId)) {
      return c.json({ success: false, error: 'Invalid assignment ID' }, 400);
    }

    const assignment = await getAssignmentById(c.env.DB, assignmentId);

    if (!assignment) {
      return c.json({ success: false, error: 'Assignment not found' }, 404);
    }

    await deleteAssignment(c.env.DB, assignmentId);

    return c.json({
      success: true,
      data: { message: 'Assignment deleted successfully' },
    });
  } catch (error) {
    console.error('Delete assignment error:', error);
    return c.json({ success: false, error: 'Failed to delete assignment' }, 500);
  }
});

// GET /assignments/:id/submissions - Get all submissions for an assignment (Teacher only)
assignments.get('/:id/submissions', async (c) => {
  try {
    const user = c.get('user');

    if (user.role !== 'teacher') {
      return c.json({ success: false, error: 'Only teachers can view all submissions' }, 403);
    }

    const assignmentId = parseInt(c.req.param('id'));

    if (isNaN(assignmentId)) {
      return c.json({ success: false, error: 'Invalid assignment ID' }, 400);
    }

    const submissions = await getSubmissionsByAssignment(c.env.DB, assignmentId);

    // Enrich submissions with user data
    const enrichedSubmissions = await Promise.all(
      submissions.map(async (sub) => {
        const student = await getUserById(c.env.DB, sub.user_id);
        return {
          ...sub,
          student_name: student?.name || 'Unknown',
          student_username: student?.username || 'unknown',
        };
      })
    );

    return c.json({ success: true, data: enrichedSubmissions });
  } catch (error) {
    console.error('Get submissions error:', error);
    return c.json({ success: false, error: 'Failed to fetch submissions' }, 500);
  }
});

// ============================================
// STUDENT ROUTES
// ============================================

// POST /assignments/:id/submit - Submit assignment
assignments.post('/:id/submit', async (c) => {
  try {
    const user = c.get('user');
    const assignmentId = parseInt(c.req.param('id'));
    const body = await c.req.json();

    if (isNaN(assignmentId)) {
      return c.json({ success: false, error: 'Invalid assignment ID' }, 400);
    }

    const assignment = await getAssignmentById(c.env.DB, assignmentId);

    if (!assignment) {
      return c.json({ success: false, error: 'Assignment not found' }, 404);
    }

    // Check if due date has passed
    if (assignment.due_date) {
      const dueDate = new Date(assignment.due_date);
      const now = new Date();
      if (now > dueDate) {
        return c.json({ success: false, error: 'Assignment deadline has passed' }, 400);
      }
    }

    // Check max attempts
    const userSubmissions = await getSubmissionsByUser(c.env.DB, user.id, assignmentId);
    if (userSubmissions.length >= assignment.max_attempts) {
      return c.json({ success: false, error: 'Maximum attempts reached' }, 400);
    }

    const { answers, score, completed } = body;

    // Create submission
    const submission = await createSubmission(c.env.DB, {
      assignment_id: assignmentId,
      user_id: user.id,
      answers,
      score: score || 0,
      completed: completed ? 1 : 0,
      attempt_number: userSubmissions.length + 1,
      auto_feedback: null,
      teacher_feedback: null,
      started_at: new Date().toISOString(),
      submitted_at: completed ? new Date().toISOString() : null,
      graded_at: null,
    });

    if (!submission) {
      return c.json({ success: false, error: 'Failed to create submission' }, 500);
    }

    return c.json(
      {
        success: true,
        data: {
          submission,
          message: 'Submission created successfully',
        },
      },
      201
    );
  } catch (error) {
    console.error('Submit assignment error:', error);
    return c.json({ success: false, error: 'Failed to submit assignment' }, 500);
  }
});

// GET /assignments/:id/my-submissions - Get my submissions for an assignment
assignments.get('/:id/my-submissions', async (c) => {
  try {
    const user = c.get('user');
    const assignmentId = parseInt(c.req.param('id'));

    if (isNaN(assignmentId)) {
      return c.json({ success: false, error: 'Invalid assignment ID' }, 400);
    }

    const submissions = await getSubmissionsByUser(c.env.DB, user.id, assignmentId);

    return c.json({ success: true, data: submissions });
  } catch (error) {
    console.error('Get my submissions error:', error);
    return c.json({ success: false, error: 'Failed to fetch submissions' }, 500);
  }
});

// PATCH /assignments/submissions/:id - Update submission (for teacher feedback)
assignments.patch('/submissions/:id', async (c) => {
  try {
    const user = c.get('user');
    const submissionId = parseInt(c.req.param('id'));
    const body = await c.req.json();

    if (isNaN(submissionId)) {
      return c.json({ success: false, error: 'Invalid submission ID' }, 400);
    }

    const submission = await getSubmissionById(c.env.DB, submissionId);

    if (!submission) {
      return c.json({ success: false, error: 'Submission not found' }, 404);
    }

    // Only teacher can add feedback, or student can update their own incomplete submission
    if (user.role === 'teacher') {
      // Teacher can add feedback and score
      const updatedSubmission = await updateSubmission(c.env.DB, submissionId, {
        ...body,
        graded_at: new Date().toISOString(),
      });

      return c.json({
        success: true,
        data: {
          submission: updatedSubmission,
          message: 'Feedback added successfully',
        },
      });
    } else if (user.id === submission.user_id && !submission.completed) {
      // Student can update their own incomplete submission
      const updatedSubmission = await updateSubmission(c.env.DB, submissionId, body);

      return c.json({
        success: true,
        data: {
          submission: updatedSubmission,
          message: 'Submission updated successfully',
        },
      });
    } else {
      return c.json({ success: false, error: 'Not authorized to update this submission' }, 403);
    }
  } catch (error) {
    console.error('Update submission error:', error);
    return c.json({ success: false, error: 'Failed to update submission' }, 500);
  }
});

export default assignments;
