// This is a simple script to drop the art_id_1 index from the tickets collection
// Run this script on your MongoDB server using the mongo shell:
// mongo aiscraper drop-art-id-index.js

// Connect to the aiscraper database
db = db.getSiblingDB('aiscraper');

// Print current indexes
print('Current indexes:');
db.tickets.getIndexes().forEach(function (index) {
	printjson(index);
});

// Drop the art_id_1 index
print('\nDropping art_id_1 index...');
try {
	db.tickets.dropIndex('art_id_1');
	print('Successfully dropped art_id_1 index');
} catch (e) {
	print('Error dropping index: ' + e);
}

// Print updated indexes
print('\nUpdated indexes:');
db.tickets.getIndexes().forEach(function (index) {
	printjson(index);
});

// Exit
print(
	'\nDone. The application will create a new non-unique index on art_id when it restarts.'
);
