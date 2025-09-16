const { data } = require('react-router-dom');
const User = require('../modules/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// register controller
const registerUser = async (req, res) =>{
    try {
        // extract user information from req.body
        const {username, email, password, role} = req.body;
        
        // check if user already exists or not 
        const checkExistingUser = await User.findOne({$or: [{email}, {username}]});
        if(checkExistingUser){
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email or username ! Please login with different email or username'

            })
        }
        // hash the user password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // create a new user and save in database 
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role: role || 'user'
        })

        await newUser.save();
        if(newUser){
            res.status(201).json({
                success: true,
                message: 'User registered successfully ',
                data: newUser
            })
        } else {
            console.log("user data is",newUser)
            res.status(400).json({ 
                success: false,
                message: 'User registration failed ',
                
            })
        }

    } catch (error) {
        console.log(error);
        console.log("username is :", req.body.username);
        res.status(500).json({
            success: false,
            message: 'Some error occurred ! please try again'
        })
    }
}

// login controller
const loginUser = async (req, res) =>{
    try {
        const {username, password} = req.body;
        const user = await User.findOne({username});
        if(!user){
            return res.status(400).json({
                success: false,
                message:' User not found with this username ! Please register first'
            })
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if(!isPasswordMatch){
            return res.status(400).json({
                success: false,
                message: 'Incorrect password ! Please try again'
            })
        }
        
        // create user token
        const accessToken = jwt.sign({
            userId: user._id,
            username: user.username,
            role: user.role
        }, process.env.JWT_SECRET_KEY, 
    {expiresIn: '1d'})
        res.status(200).json({
            success: true,
            message: 'User logged in successfully',
            accessToken
        })

       
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Some error occurred ! please try again'
        })
    }
}

const changePassword = async (req,res)=>{
    try {
        const userId = req.userInfo.userId;

        // extract old and new password
        const {oldPassword, newPassword} = req.body;

        // find the current logged in user

        const user = await User.findById(userId);

        if(!user){
            return res.status(400).json({
                success: false,
                message: 'User not found'
            })
        }

        // check if the old password is correct 
        const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);

        if(!isPasswordMatch){
            return res.status(400).json({
                success: false,
                message: 'Old password is not correct Please try again'
            })
        }

        // hash the new password
        const salt = await bcrypt.genSalt(10);
        const newHashedPassword = await bcrypt.hash(newPassword, salt);

        // update user password
        user.password = newHashedPassword;
        await user.save()

        res.status(200).json({
            success: true,
            message: 'Password change successfully'
        })

    }
     catch (error) {
         console.log(error);
        res.status(500).json({
            success: false,
            message: 'Some error occurred ! please try again'
        })
    }
    }



module.exports = {registerUser, loginUser , changePassword};