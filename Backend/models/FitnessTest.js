import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const FitnessTestSchema = new Schema({
  user_id: {
    type: String,
    required: true,
    description: 'Unique identifier for the user'
  },
  date: {
    type: Date,
    required: true,
    description: 'Date of the fitness test'
  },
  goal: {
    type: String,
    required: true,
    description: 'User\'s fitness goal for the test'
  },
  exercises: {
    strength: {
      pushup_reps: {
        type: Number,
        required: true,
        min: 0,
        description: 'Number of push-up repetitions'
      },
      squats_reps: {
        type: Number,
        required: true,
        min: 0,
        description: 'Number of squat repetitions'
      },
      pull_ups_reps: {
        type: Number,
        required: true,
        min: 0,
        description: 'Number of pull-up repetitions'
      }
    },
    flexibility: {
      sit_and_touch_cm: {
        type: Number,
        required: true,
        description: 'Sit and touch distance in centimeters'
      },
      shoulder_stretch_cm: {
        type: Number,
        required: true,
        description: 'Shoulder stretch distance in centimeters'
      },
      hamstring_stretch_cm: {
        type: Number,
        required: true,
        description: 'Hamstring stretch distance in centimeters'
      }
    },
    cardio_endurance: {
      ten_min_run_bpm: {
        type: Number,
        required: true,
        min: 0,
        description: 'Heart rate after 01-minute run in beats per minute'
      },
      ten_min_cycle_bpm: {
        type: Number,
        required: true,
        min: 0,
        description: 'Heart rate after 10-minute cycle in beats per minute'
      }
    }
  },
  physical_data: {
    weight_kg: {
      type: Number,
      required: true,
      min: 0,
      description: 'Weight in kilograms'
    },
    height: {
      feet: {
        type: Number,
        required: true,
        min: 0,
        description: 'Height in feet'
      },
      inches: {
        type: Number,
        required: true,
        min: 0,
        max: 11.99,
        description: 'Height in inches'
      }
    },
    bpm_before_test: {
      type: Number,
      required: true,
      min: 0,
      description: 'BPM At Rest (before test)'
    },
    bpm_after_test: {
      type: Number,
      required: true,
      min: 0,
      description: 'MHR (after test)',
      bmi: {
        type: Number,
        required: false,
        min: 0,
        description: 'Body Mass Index (BMI) calculated from weight and height'
      }
    }
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

export default mongoose.model('FitnessTest', FitnessTestSchema);