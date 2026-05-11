const groupModel = require('../model/group')


exports.createGroup = async(req, res)=>{
    try {
        const {groupname, contributionAmount, contributionFrequency, payoutFrequency, describeGroup, totalMembers} = req.body
        
        const newGroup = new groupModel({
            groupname,
            contributionAmount, 
            contributionFrequency, 
            payoutFrequency, 
            describeGroup, 
            totalMembers,
            createdBy: req.user.id
        })
        const min = 2
        const max = 12
        if (totalMembers >= max){
            return res.status(404).json({
                message: "maximum number exceeded, members must be less than 12"
            })
        }else if (totalMembers < min){
            return res.status(404).json({
                message: "minimum number not reached, number must be greater than 2 "
            })
        }
        newGroup.members.push(req.user.id);
        await newGroup.save()
        res.status(201).json({
            message: "Group created successfully",
            data: newGroup
        })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            message: "something went wrong"
        })
    }
}

exports.getAll = async (req, res) => {
    try {
        const allGroup = await groupModel.find().populate('members', 'fullname')
        res.status(200).json({
            message: "Group found",
            data: allGroup
        })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            message: "something went wrong"
        })
    }
}

exports.getOne = async (req, res) => {
    try {
        const oneGroup = await groupModel.findOne().populate('members', 'fullname email phoneNumber')
        res.status(200).json({
            message: "one group retrieved successfully",
            data: oneGroup
        })
    } catch (error) {
        next(error)
    }
}

exports.removeMemberFromGroup = async(req, res) => {
    try {
        const { id } = req.user;
        const { groupId, memberId } = req.params;
        const group = await groupModel.findById(groupId)
        if(!group){
            console.log(group)
            return res.status(404).json({
            message: "Group not found",
            })
        }
        console.log(id)
        console.log(group.createdBy)
        
        if(group.createdBy.toString() !== id){
            return res.status(403).json({
                message: "Unauthorized access, not an admin"
            })
        }

        if(group.createdBy.toString() === memberId){
            return res.status(403).json({
                message: "Unauthorized access, cannot remove admin"
            })
        }
        const memberIndex = group.members.findIndex((element) => element.toString() === memberId)
        if(memberIndex == -1){
            return res.status(404).json({
                message: "User is not a member of this group"
            })
        }
        group.members.splice(memberIndex, 1);
        await group.save()

        return res.status(200).json({
            message: "Member removed successfully",
            data: group
        })
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({
            message: "Something went wrong"
        })
    }
}