import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Function to update a user's admin status
async function updateAdminStatus(email, isAdmin = true) {
  try {
    // Access the users collection directly
    const usersCollection = mongoose.connection.collection('users');
    
    // Find the user first to confirm they exist
    const user = await usersCollection.findOne({ email });
    
    if (!user) {
      console.log(`No user found with email: ${email}`);
      return;
    }
    
    console.log(`Found user: ${user.username} (${user.email})`);
    console.log(`Current admin status: ${user.isAdmin ? 'Admin' : 'Not Admin'}`);
    
    // Update the user
    const result = await usersCollection.updateOne(
      { email }, 
      { $set: { isAdmin } }
    );
    
    console.log(`Updated admin status for ${email} to: ${isAdmin ? 'Admin' : 'Not Admin'}`);
    console.log(`Modified ${result.modifiedCount} document(s)`);
  } catch (error) {
    console.error('Error updating admin status:', error);
  } finally {
    // Close the connection when done
    mongoose.connection.close();
  }
}

// Replace with your email
const userEmail = 'jonusashaba@gmail.com';
updateAdminStatus(userEmail, true); // Set to true for admin, false to remove admin privileges