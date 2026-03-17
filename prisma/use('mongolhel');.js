use('mongolhel');

db.getCollection('courses').insertOne({
  title: "Mongolian for Beginners",
  level: "A0",
  createdAt: new Date()
});
