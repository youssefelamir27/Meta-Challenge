const mongoose = require ('mongoose')
const validator = require ('validator')
const bcryptjs = require ('bcryptjs')
const jwt = require ('jsonwebtoken')

const userSchema = new mongoose.Schema ( {
    username : {
        type: String,
        required : true,
        trim : true
    },
    password : {
        type: String,
        required: true,
        trim: true,
        minlength: 8,
        validate(value){
            let password = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])");
            if(!password.test(value)){
                throw new Error("Password must include uppercase , lowercase , numbers , speacial characters")
            }
        }

    },
    email : {
        type: String,
        required: true,
        trim: true,
        lowercase : true,
        unique: true,
        validate(val){
            if(!validator.isEmail(val)){
                throw new Error ('Email is INVALID')
            }
        }
    },
    age : {
        type: Number,
        default: 18,
        validate(val){
            if (val <= 0){
                throw new Error ('age must be a positive number')
            }
        }
    },
    city: {
        type:String
    },
    tokens : [
        {
            type: String,
            required : true
        }
    ]
})


// virtual relations 

  userSchema.virtual ('tasks' , {
     ref: 'Task',
     localField : "_id",
     foreignField :"owner"
  }) 


////////////////////////////////////////////////////////////////////////////////////////
userSchema.pre ("save" , async function ()  {
       const user = this   //  => Document 

       if (user.isModified('password')) {
        user.password = await bcryptjs.hash(user.password, 8)
       }
})
//////////////////////////////////////////////////////////////////////////////////////////
// Login 

userSchema.statics.findByCredentials = async (em,pass) =>{
  
    const user = await User.findOne({email:em})
    if(!user){
        throw new Error('Unable to login')
    }
   
    const isMatch = await bcryptjs.compare(pass,user.password)
  
    if(!isMatch){
        throw new Error('Unable to login')
    }
    return user
}

//////////////////////////////////////////////////////////////////////////////////////////
userSchema.methods.generateToken = async function () {
    const user = this 
    const token = jwt.sign(
        { _id: user._id.toString() }, 
        process.env.JWT_SECRET,  
        { expiresIn: '7 days' }  
    )
    user.tokens = user.tokens.concat(token)
    await user.save()
    return token
}
//////////////////////////////////////////////////////////////////////////////////////////
//  hide private data 

  userSchema.methods.toJSON = function (){
      const user = this 

    //    convert doc to obj  = toObject 
      const userObject = user.toObject()

      delete userObject.password
      delete userObject.tokens

      return userObject 
  }



  //////////////////////////////////////////////////////////////////////
const User = mongoose.model( 'User' , userSchema  )


module.exports = User