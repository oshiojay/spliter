const requestModel = require('../model/groupRequest')
const groupModel = require('../model/group')

exports.createRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const {groupId} = req.params;

        const group = await groupModel.findById(groupId);
        if(!group){
            return res.status(404).json({
                message: 'Group not found'
            })
        }

        const user = await userModel.findById(id);
        if(!user){
            return res.status(404).json({
                message: 'User not found '
            })
        }

        const request = new requestModel({
            groupId,
            groupName: group.groupname,
            userId: id,
            userInfo: user.fullname
        });

        await request.save();

        res.status(200).json({
            message: 'Request sent successfully'
        })
        
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

exports.acceptRequest = async (req, res) => {
    try {
        //Get the Admin ID from the request User
        const adminId = req.user.id;
        // Get the request ID from the params
        const { requestId } = req.params;
        // Check if request exists
        const request = await requestModel.findById(requestId)
        if(!request){
            return res.status(404).json({
                message: 'Request Not Found'
            })
        }

        if (request.status === 'Accepted' || request.status === 'Rejected') {
            return res.status(404).json({
                message: 'Request already passed'
            })
        }

        // Find the group and confirm if the Admin matches the group Admin
        if (!group){
            return res.status(404).json({
                message: 'Group not found'
            })
        }

        // Confirm the admin ID
        if (group.createdBy.toString() !== adminId) {
            return res.status(403).json({
                message: 'Unauthorized: Not an admin'
            })
        }

        // Add the user to the group and update the status of the request
        group.members.push(request.userId);
        request.status = 'Accepted';

        // Save the changes to database 
        await group.save()
        await request.save()

        res.status(200).json({
            message: 'Request Accepted successfully'
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

exports.allRequestForAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { groupId } = req.params;

        const group = await groupModel.findById(groupId);
        if (!group) {
            return res.status(404).json({
                message: 'Group not found'
            })
        }

        if (group.createdBy.toString() !== id) {
            return res.status(403).json({
                message: 'Unauthorized to view request, Not an admin'
            })
        }

        const requests = await requestModel.find({ groupId });

        res.status(200).json({
            message: 'All requests retrieved successfully',
            data: requests
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

exports.rejectRequest = async (req, res) => {
    
}