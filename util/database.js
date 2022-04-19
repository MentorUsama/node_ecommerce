const Sequelize = require('sequelize')
const sequilize = new Sequelize('node-database','root','password',{
    dialect:'mysql',
    host:'localhost'
})

module.exports = sequilize
