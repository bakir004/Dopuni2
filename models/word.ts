const mongoose = require('mongoose')

export const wordSchema = new mongoose.Schema({
  text: String,
})