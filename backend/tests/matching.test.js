const mongoose = require('mongoose');
const User = require('../src/models/User');
const Group = require('../src/models/Group');
const Invitation = require('../src/models/Invitation');
const PendingMatch = require('../src/models/PendingMatch');
const { generateEmbeddings } = require('../src/services/embeddingService');
const { runMatchingForUser } = require('../src/services/matchingService');
const { acceptInvitation, rejectInvitation } = require('../src/services/invitationService');

const TEST_DB_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/interesthub_test';

beforeAll(async () => {
  await mongoose.connect(TEST_DB_URI);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

beforeEach(async () => {
  await User.deleteMany({});
  await Group.deleteMany({});
  await Invitation.deleteMany({});
  await PendingMatch.deleteMany({});
});

describe('Master Project Prompt Test Cases: Matching & Group Lifecycle', () => {
  test('Test Case 3: Pending Matching - Only 2 compatible users', async () => {
    // Register Rahul
    const rahul = await User.create({
      name: 'Rahul',
      email: 'rahul@example.com',
      password: 'password123',
      interests: ['Cricket', 'Travelling'],
      embedding: await generateEmbeddings(['Cricket', 'Travelling'].join(' ')),
      location: { type: 'Point', coordinates: [77.2090, 28.6139] },
    });

    const res1 = await runMatchingForUser(rahul._id);
    expect(res1.action).toBe('WAITING_IN_PENDING_POOL');

    // Register Aman
    const aman = await User.create({
      name: 'Aman',
      email: 'aman@example.com',
      password: 'password123',
      interests: ['Cricket', 'Travelling', 'Adventure'],
      embedding: await generateEmbeddings(['Cricket', 'Travelling', 'Adventure'].join(' ')),
      location: { type: 'Point', coordinates: [77.2100, 28.6150] },
    });

    const res2 = await runMatchingForUser(aman._id);
    // With only Rahul and Aman, we have only 1 compatible candidate for Aman (requires at least 2 other compatible users)
    expect(res2.action).toBe('WAITING_IN_PENDING_POOL');

    // Verify both are in pending pool
    const pendingCount = await PendingMatch.countDocuments({ status: 'PENDING' });
    expect(pendingCount).toBe(2);

    // Verify NO groups were created yet
    const groupCount = await Group.countDocuments();
    expect(groupCount).toBe(0);
  });

  test('Test Case 1: Automatic Group Creation - 3 Compatible Users', async () => {
    // 1. Rahul
    const rahul = await User.create({
      name: 'Rahul',
      email: 'rahul@example.com',
      password: 'password123',
      interests: ['Cricket', 'Travelling'],
      embedding: await generateEmbeddings('Cricket Travelling'),
      location: { type: 'Point', coordinates: [77.2090, 28.6139] },
    });
    await runMatchingForUser(rahul._id);

    // 2. Aman
    const aman = await User.create({
      name: 'Aman',
      email: 'aman@example.com',
      password: 'password123',
      interests: ['Cricket', 'Travelling', 'Adventure'],
      embedding: await generateEmbeddings('Cricket Travelling Adventure'),
      location: { type: 'Point', coordinates: [77.2100, 28.6150] },
    });
    await runMatchingForUser(aman._id);

    // 3. Priya
    const priya = await User.create({
      name: 'Priya',
      email: 'priya@example.com',
      password: 'password123',
      interests: ['Cricket', 'Travelling', 'Photography'],
      embedding: await generateEmbeddings('Cricket Travelling Photography'),
      location: { type: 'Point', coordinates: [77.2150, 28.6180] },
    });
    const resPriya = await runMatchingForUser(priya._id);

    // Expected: Group created with 3 invited members
    expect(resPriya.action).toBe('CREATED_NEW_GROUP');
    expect(resPriya.usersInvitedCount).toBe(3);

    const group = await Group.findById(resPriya.groupId);
    expect(group).not.toBeNull();
    expect(group.status).toBe('FORMING');
    expect(group.members.length).toBe(3);

    // Verify 3 invitations exist
    const invitations = await Invitation.find({ groupId: group._id });
    expect(invitations.length).toBe(3);

    // User 1 accepts
    const invRahul = invitations.find((i) => i.userId.toString() === rahul._id.toString());
    await acceptInvitation(invRahul._id, rahul._id);
    let updatedGroup = await Group.findById(group._id);
    expect(updatedGroup.status).toBe('FORMING');
    expect(updatedGroup.getAcceptedCount()).toBe(1);

    // User 2 accepts
    const invAman = invitations.find((i) => i.userId.toString() === aman._id.toString());
    await acceptInvitation(invAman._id, aman._id);
    updatedGroup = await Group.findById(group._id);
    expect(updatedGroup.status).toBe('FORMING');
    expect(updatedGroup.getAcceptedCount()).toBe(2);

    // User 3 accepts -> Group activates!
    const invPriya = invitations.find((i) => i.userId.toString() === priya._id.toString());
    await acceptInvitation(invPriya._id, priya._id);
    updatedGroup = await Group.findById(group._id);
    expect(updatedGroup.status).toBe('ACTIVE');
    expect(updatedGroup.getAcceptedCount()).toBe(3);
  });

  test('Test Case 2: Existing Group Matching - 4th User Matches Existing Group', async () => {
    // Create an active group with Cricket & Travelling
    const baseGroup = await Group.create({
      name: 'Cricket & Travelling Circle',
      description: 'Community for travel & cricket',
      interests: ['Cricket', 'Travelling'],
      embedding: await generateEmbeddings('Cricket Travelling'),
      location: { type: 'Point', coordinates: [77.2090, 28.6139] },
      status: 'ACTIVE',
      minMembers: 3,
      maxMembers: 10,
      members: [
        { user: new mongoose.Types.ObjectId(), role: 'member', status: 'ACCEPTED' },
        { user: new mongoose.Types.ObjectId(), role: 'member', status: 'ACCEPTED' },
        { user: new mongoose.Types.ObjectId(), role: 'member', status: 'ACCEPTED' },
      ],
    });

    // 4th User: Vikram
    const vikram = await User.create({
      name: 'Vikram',
      email: 'vikram@example.com',
      password: 'password123',
      interests: ['Cricket', 'Travelling'],
      embedding: await generateEmbeddings('Cricket Travelling'),
      location: { type: 'Point', coordinates: [77.2120, 28.6160] },
    });

    const result = await runMatchingForUser(vikram._id);

    // Expected: Invited to existing group, NO duplicate group created!
    expect(result.action).toBe('INVITED_TO_EXISTING_GROUP');
    expect(result.groupId.toString()).toBe(baseGroup._id.toString());

    // Total groups should still be 1
    const totalGroups = await Group.countDocuments();
    expect(totalGroups).toBe(1);

    // Vikram should have received an invitation
    const invitation = await Invitation.findOne({ userId: vikram._id, groupId: baseGroup._id });
    expect(invitation).not.toBeNull();
    expect(invitation.status).toBe('PENDING');
  });

  test('Test Case 4: Group Capacity - Max 10 Reserved Seats', async () => {
    // Create a group that already has 10 members (reserved seats full)
    const members = [];
    for (let i = 0; i < 10; i++) {
      members.push({
        user: new mongoose.Types.ObjectId(),
        role: 'member',
        status: i < 5 ? 'ACCEPTED' : 'INVITED',
      });
    }

    const fullGroup = await Group.create({
      name: 'Full Community',
      interests: ['Cricket', 'Travelling'],
      embedding: await generateEmbeddings('Cricket Travelling'),
      location: { type: 'Point', coordinates: [77.2090, 28.6139] },
      status: 'ACTIVE',
      minMembers: 3,
      maxMembers: 10,
      members,
    });

    expect(fullGroup.hasAvailableSeat()).toBe(false);

    // Register user 11
    const user11 = await User.create({
      name: 'Rohit11',
      email: 'rohit11@example.com',
      password: 'password123',
      interests: ['Cricket', 'Travelling'],
      embedding: await generateEmbeddings('Cricket Travelling'),
      location: { type: 'Point', coordinates: [77.2090, 28.6139] },
    });

    const result = await runMatchingForUser(user11._id);

    // Should NOT be added to fullGroup because max capacity of 10 is reached!
    expect(result.action).not.toBe('INVITED_TO_EXISTING_GROUP');
    const updatedFullGroup = await Group.findById(fullGroup._id);
    expect(updatedFullGroup.getReservedCount()).toBe(10);
  });

  test('Test Case 5: Invitation Rejection', async () => {
    const user = await User.create({
      name: 'RejectingUser',
      email: 'reject@example.com',
      password: 'password123',
    });

    const group = await Group.create({
      name: 'Test Group',
      status: 'FORMING',
      members: [{ user: user._id, role: 'member', status: 'INVITED' }],
    });

    const invitation = await Invitation.create({
      groupId: group._id,
      userId: user._id,
      matchScore: 85,
      status: 'PENDING',
    });

    await rejectInvitation(invitation._id, user._id);

    const updatedInv = await Invitation.findById(invitation._id);
    expect(updatedInv.status).toBe('REJECTED');

    const updatedGroup = await Group.findById(group._id);
    expect(updatedGroup.members.length).toBe(0);
    expect(updatedGroup.status).toBe('FORMING');
  });
});
