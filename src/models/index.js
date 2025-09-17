import mongoose from 'mongoose';

const exampleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
});

const ExampleModel = mongoose.model('Example', exampleSchema);

export { ExampleModel };