const { createPool } = require("mysql");
// const mysql2 = require("mysql2/promise");
const admin = require("firebase-admin");
const serviceAccount = require("./quizapp-eadce-firebase-adminsdk-k5dwa-fc34db0138.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://hiyab-afa75-default-rtdb.firebaseio.com",
});

const pool = createPool({
  host: "localhost",
  user: "tecxoulsoft_quiz",
  database: "tecxoulsoft_quiz",
  password: "Usama@1994181",
});

const UPDATE_USER_SOCKET_ID = "UPDATE users SET ? WHERE id = ?";
const REMOVE_USER_SOCKET_ID = "UPDATE users SET ? WHERE socketId = ?";
const SELECT_FILTERED_SCORE =
  "SELECT * FROM scores WHERE std_id=? AND quiz_id=? AND ques_id=? ";
const INSERT_SCORE = "INSERT INTO scores SET ?";
const UPDATE_SCORE = "UPDATE scores SET ? WHERE id = ?";
const SELECT_FILTERED_OPTION =
  "SELECT_FILTERED_OPTIONSELECT * FROM options WHERE id=? AND quiz_id=? AND ques_id=? ";
const SELECT_OFFLINE_USERS = " SELECT * FROM users WHERE socketId=?";

const SELECT_FILTERED_OPTION_BY_QUESTION_ID =
  "SELECT * FROM options WHERE question_id=?";

  const INSERT_ANSWER_IN_TEMPS="INSERT INTO temps SET ?";

const addScore = async (data) => {
  const { std_id, quiz_id, ques_id, option_id, number} = data;

  pool.query(
    SELECT_FILTERED_SCORE,
    [std_id, quiz_id, ques_id],
    (error, results, fields) => {
      if (error) throw error;
      console.log(results[0]);
      if (!results[0]) {
        insertScore(data);
      } else {
        updateScore(results[0].id, data);
      }
    }
  );
};

const addSocketId = async (data) => {
  pool.query(
    UPDATE_USER_SOCKET_ID,
    [{ socketId: data.socketId }, data.studentId],
    (error, results, fields) => {
      if (error) throw error;
      console.log(results);
    }
  );
};
const removeSocketId = async (data) => {
  pool.query(
    REMOVE_USER_SOCKET_ID,
    [{ socketId: null }, data.socketId],
    (error, results, fields) => {
      if (error) throw error;
      console.log(results);
    }
  );
};

const sendQuizStartNotification = async (data) => {
  const { message, title } = data;
  pool.query(SELECT_OFFLINE_USERS, [null], (error, results, fields) => {
    if (error) throw error;

    if (results.length > 0) {
      results.forEach((user) => {
        sendNotification(user.fcm_token, message, title);
      });
    }
  });
};

//=================== internal use mathods ===========================
function insertScore(data) {
  const score = 0;
  if (getScore(data)) {
    score = data.number;
  } else {
    addAnswerInTemp(data);
  }
  pool.query(
    INSERT_SCORE,
    { ...data, created_at: new Date(), updated_at: new Date(), score },
    (error, results, fields) => {
      if (error) throw error;
      console.log(results);
    }
  );
}

function updateScore(scoreId, data) {
  const score = 0;
  if (getScore(data)) {
    score = data.number;
  }
  if (score > 0) {
    pool.query(UPDATE_SCORE, [{ score }, scoreId], (error, results, fields) => {
      if (error) throw error;
      console.log(results);
    });
  }
}

function getScore(data) {
  const { std_id, quiz_id, ques_id, option_id } = data;
  pool.query(
    SELECT_FILTERED_OPTION,
    [option_id, quiz_id, ques_id],
    (error, results, fields) => {
      if (error) throw error;
      return results[0].is_ans == 1 || results[0].is_ans == true;
    }
  );
}

function sendNotification(fcm_token, message, title) {
  const notificationMessage = {
    data: {
      key1: "Firebase notification send ",
      key2: "Send message",
    },
    notification: {
      title: title,
      body: message,
    },
    token: fcm_token,
  };

  admin
    .messaging()
    .send(notificationMessage)
    .then((response) => {
      console.log(
        "Successfully sent message:",
        response,
        "message:",
        notificationMessage
      );
    })
    .catch((error) => {
      console.error("Error sending message:", error);
    });
}

function addAnswerInTemp(data) {

  const { std_id, quiz_id, ques_id, option_id, number} = data;
  pool.query(
    SELECT_FILTERED_OPTION_BY_QUESTION_ID,
    [quiz_id],
    (error, results, fields) => {
      let isAnswerExist = false;
      if (error) throw error;
      results.forEach((option) => {
        if (option.is_ans == 1) {
          isAnswerExist = true;
        }
      });


      if(!isAnswerExist){
        pool.query(
          INSERT_SCORE,
          { user_id:std_id, quiz_id, question_id:ques_id,option_id , created_at: new Date(), updated_at: new Date() },
          (error, results, fields) => {
            if (error) throw error;
            console.log(results);
          })
      }


    }





  );
}
//====================================================================
module.exports = {
  addScore,
  addSocketId,
  removeSocketId,
  sendQuizStartNotification,
};
