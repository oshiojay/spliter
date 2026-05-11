const swagger = require('swagger-jsdoc')

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'splita app',
            version: '1.0.0',
            description: 'backend documentation for splita'
        },
        servers:[
        {
            url: 'https://spliter-55gs.onrender.com',
            description: 'The hosted route'
        },
        {
            url: 'http://localhost:4536',
            description: 'Localhost'
        }
    ],
    components:{
        securitySchemes:{
            bearerAuth:{
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT"
            }
        }
    }
   
    },
     apis: [
        "./docs/user.yaml", "./docs/group.yaml"
    ]
}

module.exports = swagger(options)