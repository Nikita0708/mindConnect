import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const ResearchSchema = new Schema({
  '@GROUP_ID': String,
});

const Research = model('researches', ResearchSchema);

export default Research;
