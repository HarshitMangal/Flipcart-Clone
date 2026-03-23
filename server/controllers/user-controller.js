import User from "../model/user-schema.js";

export const userSignup = async (req, res) => {
    try {
        console.log("req.body =", req.body);

        const exist = await User.findOne({ email: req.body.email });

        if (exist) {
            return res.status(400).json({ message: "User already exists" });
        }

        const newUser = new User(req.body);
        await newUser.save();

        return res.status(200).json({
            message: "Signup successful",
            data: newUser
        });
    } catch (error) {
        console.error("Error while signing up user", error);
        return res.status(500).json({
            message: error.message
        });
    }
};


export const userLogin = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: "Please fill all fields" });
        }

        const user = await User.findOne({
            $or: [
                { username: username },
                { email: username }
            ]
        });

        if (!user) {
            return res.status(400).json({ message: "User does not exist" });
        }

        if (user.password !== password) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        return res.status(200).json({
            message: "Login successful",
            data: user
        });

    } catch (error) {
        console.error("Error while logging in user", error);
        return res.status(500).json({
            message: error.message
        });
    }
};  

