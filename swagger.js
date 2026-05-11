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
            url: 'http://localhost:4536',
            description: 'Documentation'
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