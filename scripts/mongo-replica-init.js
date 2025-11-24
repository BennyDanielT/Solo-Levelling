// MongoDB Replica Set Initialization Script
// This script initializes a single-node replica set for Prisma transactions

print('🔧 Initializing MongoDB replica set...');

try {
  // Initialize replica set
  rs.initiate({
    _id: 'rs0',
    members: [
      {
        _id: 0,
        host: 'mongodb:27017',
      },
    ],
  });

  print('✅ Replica set initialized successfully!');

  // Wait for replica set to be ready
  while (rs.status().ok !== 1) {
    sleep(1000);
    print('⏳ Waiting for replica set to be ready...');
  }

  print('🎉 MongoDB replica set is ready for Prisma transactions!');
} catch (error) {
  print('❌ Error initializing replica set:', error);
}
