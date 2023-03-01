const setup = async () => {
  process.env.PORT = "4000";
  process.env.DATABASE_URI = "mongodb://localhost:27017/cache";
  process.env.TIME_TO_LIVE = "600000";
  process.env.MAX_ENTRIES = "20";
  process.env.JOB_INTERVAL = "* * * * *";
};

export default setup;
