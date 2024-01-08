const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8082;

app.use(cors({
  origin: '*',  // Replace '*' with the actual frontend origin in production
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));

// Connect to the MySQL database
const sequelize = new Sequelize('FOUND_RAISING', 'root', 'Admin@123', {
  host: 'localhost',
  dialect: 'mysql',
});

// Define User model
const User = sequelize.define('User', {
  UserID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  FirstName: {
    type: DataTypes.STRING,
  },
  LastName: {
    type: DataTypes.STRING,
  },
  Email: {
    type: DataTypes.STRING,
    unique: true,
  },
  Password: {
    type: DataTypes.STRING,
  },
  RegistrationDate: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  },
  ReferralCode: {
    type: DataTypes.STRING,
    unique: true,
  },
});

// Define Donation model
const Donation = sequelize.define('Donation', {
  DonationID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  UserID: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'UserID',
    },
  },
  DonationAmount: {
    type: DataTypes.DECIMAL(10, 2),
  },
  DonationDate: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  },
  TransactionID: {
    type: DataTypes.STRING,
  },
  Status: {
    type: DataTypes.STRING,
  },
});

// Set up associations
User.hasMany(Donation, { foreignKey: 'UserID' });

app.use(bodyParser.json());

// API Routes

// Retrieve all users
app.get('/users', async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Register a new user
app.post('/users', async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    res.json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Create a new donation
app.post('/donations', async (req, res) => {
  try {
    const newDonation = await Donation.create(req.body);
    res.json(newDonation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post('/login', async (req, res) => {
    const { Email, Password } = req.body;

    try {
        const user = await User.findOne({
            where: {
                Email: Email,
                Password: Password,
            },
        });

        if (user) {
            res.json(user);
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});




sequelize.sync({ force: true }).then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
