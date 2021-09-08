const emailTemplates = {
    accountActivation: (userId) => {
        return (
            `\
            <body>\
                <h2>Hello and thank you for registering in Food Delivery!</h2>\
                <br />\
                <h4>Click on the link below to activate your account:</h4>\
                <a href='${process.env.BASE_URL}/users/activate/${userId}'>\
                    <h4>Activate my account</h4>\
                </a>\
                <br />\
                <h3>Best regards from the Food Delivery team!</h3>\
            </body>\
            `
        );
    },
    resetPassword: resetId => {
        return (
            `\
            <body>\
                <h2>Hello from Food Delivery!</h2>\
                <br />\
                <h4>We have received a request to reset your password</h4>\
                <h4>Click on the link below:</h4>\
                <a href='${process.env.CLIENT_BASE_URL}/reset-password/${resetId}'>\
                    <h4>Visit reset password page</h4>\
                </a>\
                <br />\
                <h3>Best regards from the Food Delivery team!</h3>\
            </body>\
            `
        )
    }
}

module.exports = { emailTemplates };
