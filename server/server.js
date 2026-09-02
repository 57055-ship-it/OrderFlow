const app = require('./app');
const connectDB = require('./config/db');

// Connect to MongoDB database
connectDB();

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`[OrderFlow Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
