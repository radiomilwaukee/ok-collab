'use strict'

// bcrypt docs: https://www.npmjs.com/package/bcrypt
const bcrypt = require('bcryptjs')
  , { STRING, VIRTUAL, BOOLEAN, ENUM, ARRAY, TEXT } = require('sequelize')

module.exports = db => db.define('users', {
  name: STRING,
  email: {
    type: STRING,
    validate: {
      isEmail: true,
      notEmpty: true,
    }
  },
  city: {
    type: ENUM('NYC', 'San Francisco'),
  },
  photoUrl: {
    type: STRING,
    validate: {
      isUrl: true
    }
  },
  blurb: TEXT,
  style: TEXT,
  lookingFor: TEXT,
  skills: {
    type: ARRAY(STRING),
    // set: function (str) {
    //   var arrayOfSkills;
    //   if (typeof str === 'string') {
    //     arrayOfTags = value.split(',').map(function (s) {
    //       return s.trim();
    //     });
    //     this.setDataValue('skills', arrayOfSkills);
    //   }
    //   else {
    //     this.setDataValue('skills', arrayOfSkills);
    //   }
    // }
  },
  uploads: {
    type: ARRAY(STRING),
  },


  // We support oauth, so users may or may not have passwords.
  password_digest: STRING, // This column stores the hashed password in the DB, via the beforeCreate/beforeUpdate hooks
  password: VIRTUAL // Note that this is a virtual, and not actually stored in DB
}, {
    indexes: [{ fields: ['email'], unique: true }],
    hooks: {
      beforeCreate: setEmailAndPassword,
      beforeUpdate: setEmailAndPassword,
    },
    defaultScope: {
      attributes: { exclude: ['password_digest'] }
    },
    instanceMethods: {
      // This method is a Promisified bcrypt.compare
      authenticate(plaintext) {
        return bcrypt.compare(plaintext, this.password_digest)
      }
    }
  })

module.exports.associations = (User, { OAuth, CartItem, Order }) => {
  User.hasOne(OAuth)
  User.hasMany(Order)
  // think about reviews  -- KHCL
}

function setEmailAndPassword(user) {
  user.email = user.email && user.email.toLowerCase()
  if (!user.password) return Promise.resolve(user)

  return bcrypt.hash(user.get('password'), 10)
    .then(hash => user.set('password_digest', hash))
}
