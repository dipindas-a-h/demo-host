const { Admin } = require('../../admin/models')
const { Country} = require('../../models')


const addNewAdminHelper = async (data) => {
    try {
        const {
            name,
            email,
            phoneNumber,
            designation,
            joinedDate,
            city,
            country,
            description,
            roles,
            // avatarPath,
        } = data;

        const parsedRoles = roles ? JSON.parse(roles) : [];

        const { _, error } = adminAddSchema.validate({
            ...data,
            roles: parsedRoles,
        });

        if (error) {
            throw new Error(error.details ? error.details[0].message : error.message);
        }

        // let avatarImg;
        // if (avatarPath) {
        //     avatarImg = "/" + avatarPath.replace(/\\/g, "/");
        // }

        const admin = await Admin.findOne({ email });
        if (admin) {
            throw new Error("email already exists");
        }

        // for (let i = 0; i < parsedRoles?.length; i++) {
        //     if (!isValidObjectId(parsedRoles[i])) {
        //         throw new Error("invalid admin role id");
        //     }

        //     const adminRole = await AdminRole.findById(parsedRoles[i]);
        //     if (!adminRole) {
        //         throw new Error("admin role not found");
        //     }
        // }

        const password = crypto.randomBytes(6).toString("hex");
        const hashedPassowrd = await hash(password, 8);

        const countryDetail = await Country.findOne({ isocode: country?.toUpperCase() }).lean();
        if (!countryDetail) {
            throw new Error(`country ${country} not found`);
        }

        const newAdmin = new Admin({
            name,
            email,
            password: hashedPassowrd,
            // avatar: avatarImg,
            phoneNumber,
            designation,
            joinedDate,
            city,
            country,
            description,
            roles: parsedRoles,
            role: "admin",
        });

        await newAdmin.save();

        // sendAdminPassword({ name: newAdmin.name, email, password });

        return newAdmin;
    } catch (err) {
        throw new Error(err);
    }
};

module.exports = addNewAdminHelper;

