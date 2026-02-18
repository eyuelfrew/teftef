const { Product, Users } = require("./models");

async function checkData() {
    try {
        const product = await Product.findByPk(4);
        const user = await Users.findByPk(3);

        if (product) {
            console.log(`PRODUCT_ID: 4, OWNER_ID: ${product.userId}, TYPE: ${typeof product.userId}`);
        } else {
            console.log("PRODUCT_4_NOT_FOUND");
        }

        if (user) {
            console.log(`USER_ID: 3, TYPE: ${typeof user.id}`);
        } else {
            console.log("USER_3_NOT_FOUND");
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkData();
