import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICalendarNote extends Document {
  userId: mongoose.Types.ObjectId;
  year: number;
  month: number;
  day: number;
  entries: { title: string; description: string }[];
}

const CalendarNoteSchema = new Schema<ICalendarNote>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  year: Number,
  month: Number,
  day: Number,
  entries: [
    {
      title: String,
      description: String,
    },
  ],
});

const CalendarNote: Model<ICalendarNote> = 
  mongoose.models.CalendarNote || mongoose.model<ICalendarNote>("CalendarNote", CalendarNoteSchema);

export default CalendarNote;
