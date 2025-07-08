import mongoose from "mongoose";

export interface ITodo {
  _id?: string;
  userId: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TodoSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: true 
  },
  text: { 
    type: String, 
    required: true,
    trim: true
  },
  completed: { 
    type: Boolean, 
    default: false 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Index for faster queries by userId
TodoSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.Todo || mongoose.model("Todo", TodoSchema);
