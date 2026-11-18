const Interest = require('../models/Interest');

const PREDEFINED_INTERESTS = [
  // Sports
  { name: 'Cricket', category: 'Sports', relatedInterests: ['Football', 'Badminton'] },
  { name: 'Football', category: 'Sports', relatedInterests: ['Cricket', 'Basketball'] },
  { name: 'Basketball', category: 'Sports', relatedInterests: ['Football', 'Fitness'] },
  { name: 'Badminton', category: 'Sports', relatedInterests: ['Cricket', 'Fitness'] },
  { name: 'Chess', category: 'Sports', relatedInterests: ['Technology Discussions', 'Gaming'] },
  { name: 'Cycling', category: 'Sports', relatedInterests: ['Fitness', 'Trekking', 'Adventure'] },

  // Travel
  { name: 'Travelling', category: 'Travel', relatedInterests: ['Road Trips', 'Photography', 'Exploring Places'] },
  { name: 'Trekking', category: 'Travel', relatedInterests: ['Adventure', 'Camping', 'Travelling'] },
  { name: 'Adventure', category: 'Travel', relatedInterests: ['Trekking', 'Camping', 'Travelling'] },
  { name: 'Road Trips', category: 'Travel', relatedInterests: ['Travelling', 'Camping', 'Music'] },
  { name: 'Camping', category: 'Travel', relatedInterests: ['Adventure', 'Trekking', 'Outdoor'] },
  { name: 'Exploring Places', category: 'Travel', relatedInterests: ['Travelling', 'Photography'] },

  // Technology
  { name: 'Programming', category: 'Technology', relatedInterests: ['Web Development', 'Machine Learning', 'Startups'] },
  { name: 'Artificial Intelligence', category: 'Technology', relatedInterests: ['Machine Learning', 'Programming'] },
  { name: 'Web Development', category: 'Technology', relatedInterests: ['Programming', 'Startups'] },
  { name: 'Machine Learning', category: 'Technology', relatedInterests: ['Artificial Intelligence', 'Programming'] },
  { name: 'Startups', category: 'Technology', relatedInterests: ['Entrepreneurship', 'Technology Discussions'] },
  { name: 'Technology Discussions', category: 'Technology', relatedInterests: ['Artificial Intelligence', 'Programming'] },

  // Creative
  { name: 'Photography', category: 'Creative', relatedInterests: ['Videography', 'Travelling', 'Art'] },
  { name: 'Videography', category: 'Creative', relatedInterests: ['Photography', 'Music'] },
  { name: 'Music', category: 'Creative', relatedInterests: ['Dance', 'Art'] },
  { name: 'Dance', category: 'Creative', relatedInterests: ['Music', 'Fitness'] },
  { name: 'Art', category: 'Creative', relatedInterests: ['Photography', 'Writing'] },
  { name: 'Writing', category: 'Creative', relatedInterests: ['Reading', 'Art'] },

  // Lifestyle
  { name: 'Fitness', category: 'Lifestyle', relatedInterests: ['Gym', 'Yoga', 'Cycling'] },
  { name: 'Gym', category: 'Lifestyle', relatedInterests: ['Fitness', 'Yoga'] },
  { name: 'Yoga', category: 'Lifestyle', relatedInterests: ['Fitness', 'Reading'] },
  { name: 'Cooking', category: 'Lifestyle', relatedInterests: ['Reading', 'Socializing'] },
  { name: 'Reading', category: 'Lifestyle', relatedInterests: ['Writing', 'Technology Discussions'] },
  { name: 'Movies', category: 'Lifestyle', relatedInterests: ['Gaming', 'Music'] },
  { name: 'Gaming', category: 'Lifestyle', relatedInterests: ['Movies', 'Technology'] },

  // Social
  { name: 'Networking', category: 'Social', relatedInterests: ['Business', 'Entrepreneurship', 'Startups'] },
  { name: 'Volunteering', category: 'Social', relatedInterests: ['Networking', 'Skill Sharing'] },
  { name: 'Business', category: 'Social', relatedInterests: ['Entrepreneurship', 'Networking', 'Startups'] },
  { name: 'Entrepreneurship', category: 'Social', relatedInterests: ['Business', 'Startups', 'Networking'] },
  { name: 'Skill Sharing', category: 'Social', relatedInterests: ['Volunteering', 'Networking', 'Programming'] },
];

const seedInterestsIfEmpty = async () => {
  const count = await Interest.countDocuments();
  if (count === 0) {
    console.log('[InterestService] Seeding default interests...');
    await Interest.insertMany(PREDEFINED_INTERESTS);
    console.log('[InterestService] Predefined interests seeded.');
  }
};

const getAllInterests = async () => {
  await seedInterestsIfEmpty();
  return Interest.find().sort({ category: 1, name: 1 });
};

const getCategories = () => {
  const categoriesMap = {};
  for (const item of PREDEFINED_INTERESTS) {
    if (!categoriesMap[item.category]) {
      categoriesMap[item.category] = [];
    }
    categoriesMap[item.category].push(item.name);
  }
  return categoriesMap;
};

const addCustomInterest = async (name, description, category = 'Custom') => {
  let existing = await Interest.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
  if (existing) return existing;
  return Interest.create({
    name,
    category,
    description: description || '',
  });
};

module.exports = {
  PREDEFINED_INTERESTS,
  seedInterestsIfEmpty,
  getAllInterests,
  getCategories,
  addCustomInterest,
};
