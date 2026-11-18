const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  profileImage: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const profileUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  ageRange: z.string().optional(),
  bio: z.string().max(500).optional(),
  city: z.string().optional(),
  preferredLanguage: z.string().optional(),
  profileImage: z.string().optional(),
  preferences: z
    .object({
      activityTypes: z.array(z.string()).optional(),
      indoorOutdoor: z.enum(['Indoor', 'Outdoor', 'Both']).optional(),
      allowOnline: z.boolean().optional(),
    })
    .optional(),
  onboardingCompleted: z.boolean().optional(),
});

const interestUpdateSchema = z.object({
  interests: z.array(z.string()).min(1, 'Select at least one interest'),
  customInterests: z.array(z.string()).optional(),
  customDescription: z.string().optional(),
});

const locationUpdateSchema = z.object({
  city: z.string().optional(),
  coordinates: z.array(z.number()).length(2, 'Coordinates must be [longitude, latitude]'),
  address: z.string().optional(),
  preferredRadiusKm: z.number().min(1).max(500).optional(),
});

const customInterestSchema = z.object({
  description: z.string().min(5, 'Description must be at least 5 characters'),
});

const messageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty'),
  messageType: z.enum(['TEXT', 'IMAGE', 'SYSTEM']).optional().default('TEXT'),
  attachments: z.array(z.string()).optional().default([]),
});

const activitySchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional().default(''),
  activityType: z.string().optional().default('Meetup'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  location: z.object({
    address: z.string().optional().default(''),
    coordinates: z.array(z.number()).length(2).default([77.2090, 28.6139]),
  }),
  maxParticipants: z.number().min(2).max(100).optional().default(10),
});

const reportSchema = z.object({
  reportedUser: z.string().optional(),
  reportedGroup: z.string().optional(),
  reason: z.string().min(3, 'Reason is required'),
  description: z.string().optional().default(''),
});

module.exports = {
  registerSchema,
  loginSchema,
  profileUpdateSchema,
  interestUpdateSchema,
  locationUpdateSchema,
  customInterestSchema,
  messageSchema,
  activitySchema,
  reportSchema,
};
