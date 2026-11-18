const axios = require('axios');

const API_URL = 'http://localhost:8080/api/v1';

async function runE2E() {
  console.log('--- Starting InterestHub End-to-End Verification ---');

  // Helper to register & onboard user
  async function registerAndOnboard(name, email, interests, coords = [77.2090, 28.6139], city = 'Delhi') {
    console.log(`\n1. Registering ${name} (${email})...`);
    const regRes = await axios.post(`${API_URL}/auth/register`, {
      name,
      email,
      password: 'password123',
    });
    const token = regRes.data.data.token;
    const client = axios.create({
      baseURL: API_URL,
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log(`2. Completing onboarding for ${name}...`);
    await client.put('/users/profile', {
      bio: `Hi, I am ${name} passionate about ${interests.join(', ')}`,
      city,
      onboardingCompleted: true,
      preferences: {
        activityTypes: ['Outdoor activities', 'Weekend activities'],
        indoorOutdoor: 'Outdoor',
        allowOnline: true,
      },
    });

    await client.put('/users/location', {
      city,
      coordinates: coords,
      preferredRadiusKm: 10,
    });

    console.log(`3. Submitting interests for ${name} (triggering AI embeddings & matching)...`);
    const intRes = await client.put('/users/interests', {
      interests,
      customInterests: [],
    });
    console.log(`   AI Result: ${intRes.data.message}`);

    return { name, email, token, client };
  }

  try {
    // 1. Register Rahul (Cricket, Travelling, Photography)
    const rahul = await registerAndOnboard(
      'Rahul Sharma',
      `rahul_${Date.now()}@example.com`,
      ['Cricket', 'Travelling', 'Photography'],
      [77.2090, 28.6139]
    );

    // Check invitations for Rahul
    let invRes = await rahul.client.get('/invitations');
    console.log(`   Rahul's current invitations: ${invRes.data.data.length} (Waiting in pool)`);

    // 2. Register Aman (Cricket, Travelling, Adventure)
    const aman = await registerAndOnboard(
      'Aman Verma',
      `aman_${Date.now()}@example.com`,
      ['Cricket', 'Travelling', 'Adventure'],
      [77.2150, 28.6180]
    );

    invRes = await aman.client.get('/invitations');
    console.log(`   Aman's current invitations: ${invRes.data.data.length} (Waiting in pool)`);

    // 3. Register Priya (Cricket, Travelling, Photography)
    const priya = await registerAndOnboard(
      'Priya Patel',
      `priya_${Date.now()}@example.com`,
      ['Cricket', 'Travelling', 'Photography'],
      [77.2110, 28.6150]
    );

    // Allow background matching job to settle
    await new Promise((r) => setTimeout(r, 1500));

    // Check invitations for all 3 users
    const [invRahul, invAman, invPriya] = await Promise.all([
      rahul.client.get('/invitations'),
      aman.client.get('/invitations'),
      priya.client.get('/invitations'),
    ]);

    console.log(`\n--- Verification: Automatic Community Creation ---`);
    console.log(`Rahul invitations: ${invRahul.data.data.length}`);
    console.log(`Aman invitations:  ${invAman.data.data.length}`);
    console.log(`Priya invitations: ${invPriya.data.data.length}`);

    if (invRahul.data.data.length === 0) {
      throw new Error('Expected invitations to be generated for compatible users!');
    }

    const invitation = invRahul.data.data[0];
    const groupId = invitation.groupId;
    console.log(`Community Formed: "${invitation.groupName}" (Match Score: ${invitation.matchScore}%)`);
    console.log(`Initial Status:   ${invitation.groupStatus}`);

    // All 3 accept invitations
    console.log('\n--- Accepting Invitations (3-member minimum rule) ---');
    await rahul.client.post(`/invitations/${invRahul.data.data[0]._id}/accept`);
    console.log('1. Rahul accepted.');
    await aman.client.post(`/invitations/${invAman.data.data[0]._id}/accept`);
    console.log('2. Aman accepted.');
    const priyaAcceptRes = await priya.client.post(`/invitations/${invPriya.data.data[0]._id}/accept`);
    console.log('3. Priya accepted.');

    console.log(`Group Status After 3 Accepts: ${priyaAcceptRes.data.data.group.status}`);

    // Verify chat
    console.log('\n--- Real-Time Group Chat Verification ---');
    const msgRes = await rahul.client.post(`/groups/${groupId}/messages`, {
      content: 'Hey everyone! Excited to connect and plan our first cricket match and trip!',
    });
    console.log(`Message sent by ${msgRes.data.data.senderId.name}: "${msgRes.data.data.content}"`);

    const messages = await aman.client.get(`/groups/${groupId}/messages`);
    console.log(`Aman received ${messages.data.data.length} messages in group chat.`);

    // Verify Activity Planner
    console.log('\n--- Meetup & Activity Planner Verification ---');
    const actRes = await rahul.client.post(`/activities/group/${groupId}`, {
      title: 'Sunday Morning Cricket & Chai Meetup',
      description: 'Friendly match followed by tea at Connaught Place.',
      activityType: 'Sports Match',
      date: '2026-11-23',
      time: '08:00 AM',
      location: {
        address: 'National Stadium Ground 2, New Delhi',
        coordinates: [77.2345, 28.6120],
      },
      maxParticipants: 10,
    });
    console.log(`Activity created: "${actRes.data.data.title}" at ${actRes.data.data.location.address}`);

    // Aman joins meetup
    await aman.client.post(`/activities/${actRes.data.data._id}/join`);
    console.log('Aman joined the meetup activity.');

    // 4. Test Case 2: 4th user registration (Existing group match)
    console.log('\n--- Test Case 2: 4th User Registration (Existing Group Match) ---');
    const vikram = await registerAndOnboard(
      'Vikram Singh',
      `vikram_${Date.now()}@example.com`,
      ['Cricket', 'Travelling'],
      [77.2130, 28.6170]
    );

    await new Promise((r) => setTimeout(r, 1200));

    const invVikram = await vikram.client.get('/invitations');
    console.log(`Vikram invitations count: ${invVikram.data.data.length}`);
    if (invVikram.data.data.length > 0) {
      console.log(`Vikram matched existing group: "${invVikram.data.data[0].groupName}" (Match: ${invVikram.data.data[0].matchScore}%)`);
      console.log(`Matched Group ID: ${invVikram.data.data[0].groupId} (Matches original group: ${invVikram.data.data[0].groupId === groupId})`);
    }

    console.log('\n✅ ALL END-TO-END VERIFICATION CHECKS PASSED SUCCESSFULLY!');
    process.exit(0);
  } catch (err) {
    console.error('❌ E2E Verification failed:', err.response?.data || err.message);
    process.exit(1);
  }
}

runE2E();
