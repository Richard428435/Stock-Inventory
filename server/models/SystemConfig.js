const mongoose = require('mongoose');

const systemConfigSchema = new mongoose.Schema({
  // Strictly enforce a single document
  isSingleton: { type: Boolean, default: true, unique: true },
  
  churchName: { type: String, default: 'Chariot of Fire Faith Assembly' },
  logoUrl: { type: String, default: '/pictures/Logoo_02-removebg-preview.png' },
  backgroundUrl: { type: String, default: '' },
  
  primaryColor: { type: String, default: '#3b82f6' }, // standard blue
  secondaryColor: { type: String, default: '#f59e0b' }, // standard amber
  
  loginVerses: { 
    type: [String], 
    default: [
      '"So those who received his word were baptized, and the Lord added to their number day by day those who were being saved." Acts 2:41,47',
      '"Take a census of all the congregation of Israel, from twenty years old and upward, by their clans..." Numbers 1:2-3',
      '"Obey your leaders and submit to them, for they are keeping watch over your souls..." Hebrews 13:17',
      '"Pay careful attention to yourselves and to all the flock, in which the Holy Spirit has made you overseers..." Acts 20:28',
      '"Then my God put into my heart to assemble the nobles... and I found the book of the genealogy." Nehemiah 7:5',
      '"Then those who feared the Lord spoke with one another. The Lord paid attention and heard them..." Malachi 3:16'
    ]
  }
}, { timestamps: true });

module.exports = mongoose.model('SystemConfig', systemConfigSchema);
