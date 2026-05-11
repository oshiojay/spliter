const joi = require('joi')

exports.signUpValidator = (req, res, next)=>{
    const schema = joi.object({
        fullname: joi.string().trim().pattern(/^[A-Za-z\s]{4,}$/).required().messages({
        'any.required': "fullname is required",
         "string.empty": "fullname cannot be empty",
        'string.pattern.base': "fullname must be at least 4 characters long and contain only letters and spaces"
         }),
        email: joi.string().email().required().messages({
            'any.required': "email is required",
            'string.empty': "email cannot be empty",
            "string.email": "email must be a valid email"
        }),
        phoneNumber: joi.string().pattern(/^\d{11}$/).required().messages({
            'any.required': "phone number is required",
            "string.empty": "phone number cannot be empty",
            'string.pattern.base': "phone number must be 11 digits long"
        }),
        password: joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z]).{8,}$/).required().messages({
            'any.required': "password is required",
            "string.empty": "password cannot be empty",
            'string.pattern.base': "password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one digit, and one special character"
        })
    })
    const {error} = schema.validate(req.body);
    //console.log(error.details[0].message)
    if (error){
        return res.status(400).json({
            message: error.details[0].message
        })
    }
    next()
}

exports.groupValidator = (req, res, next) => {
    const schema = joi.object({
        groupname: joi.string().trim().pattern(/^[A-Za-z\s]{4,}$/).required().messages({
        'any.required': "group name is required",
         "string.empty": "group name cannot be empty",
        'string.pattern.base': "group name must be at least 4 characters long and contain only letters and spaces"
         }),
         contributionAmount: joi.string().pattern(/^[1-9][0-9]{3,}$/).required().messages({
            'any.required': "contributionAmount is required",
            "string.empty": "contributionAmount cannot be empty",
            'string.pattern.base': "contributionAmount must be 4 digits and above"
        }),
        contributionFrequency: joi.string().pattern(/^(daily|weekly|monthly)$/).required().messages({
            'any.required': "contribution frequency is required",
            "string.empty": "contribution frequency cannot be empty",
            'string.pattern.base': "contribution frequency must be 4 digits and above"
        }),
        payoutFrequency: joi.string().pattern(/^(daily|weekly|monthly)$/).required().messages({
            'any.required': "payout frequency is required",
            "string.empty": "payout frequency cannot be empty",
            'string.pattern.base': "payout frequency must be 4 digits and above"
        }),
        describeGroup: joi.string().min(3).max(500).trim().required().messages({
            'any.required': "describeGroup is required",
            "string.empty": "describeGroup cannot be empty",
            'string.pattern.base': "describeGroup must be 4 digits and above"
        }),
        totalMembers: joi.string().pattern(/^[0-9]{2,12}$/). required().messages({
            'any.required': "total members is required",
            "string.empty": "total members cannot be empty",
            'string.pattern.base': "total members can contain a minimum of 2 and a maximum of 12"
        })
    })
     const {error} = schema.validate(req.body);
    //console.log(error.details[0].message)
    if (error){
        return res.status(400).json({
            message: error.details[0].message
        })
    }
    next()
}

exports.resetPasswordValidator = (req, res, next) => {
    const schema = joi.object({
        email: joi.string().email().required().messages({
            'any.required': "email is required",
            'string.empty': "email cannot be empty",
            "string.email": "email must be a valid email"
        }),
        otp: joi.string().pattern(/^\d{6}$/).required().messages({
            'any.required': "OTP is required",
            'string.empty': "OTP cannot be empty",
            "string.pattern.base": "OTP must only contain digits and be 6 digits"
        }),
        password: joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z]).{8,}$/).required().messages({
            'any.required': "Password is required",
            "string.empty": "Password cannot be empty",
            'string.pattern.base': "Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one digit, and one special character"
        }),
        confirmPassword: joi.string().required().valid(joi.ref('password')).messages({
            "any.only": "Confirm password must match New password",
            "any.required": "Confirm password is required"
        })
    })
    const { error } = schema.validate(req.body);
    if(error){
        return res.status(400).json({
            message: error.details[0].message
        })
    }
    next()
}

exports.changePasswordValidator = (req, res, next) => {
    const schema = joi.object({
        oldPassword: joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z]).{8,}$/).required().messages({
            'any.required': "Old password is required",
            "string.empty": "Old password cannot be empty",
            'string.pattern.base': "Old password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one digit, and one special character"
        }),
        newPassword: joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z]).{8,}$/).required().messages({
            'any.required': "New password is required",
            "string.empty": "New password cannot be empty",
            'string.pattern.base': "New password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one digit, and one special character"
        }),
        confirmPassword: joi.string().required().valid(joi.ref('newPassword')).messages({
            "any.only": "Confirm password must match New password",
            "any.required": "Confirm password is required"
        })
    })

    const { error } = schema.validate(req.body);
    if(error){
        return res.status(400).json({
            message: error.details[0].message
        })
    }

    next()
}