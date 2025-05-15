import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
admin.initializeApp();

interface RemoveFriendData {
  userA: string;
  userB: string;
}

export const removeFriend = functions.https.onCall(
  async (data: RemoveFriendData, context: functions.https.CallableContext) => {
    const { userA, userB } = data;
    if (!context.auth || context.auth.uid !== userA) {
      throw new functions.https.HttpsError("permission-denied", "Not authorized");
    }
    const db = admin.firestore();
    await db.doc(`users/${userA}`).update({
      friends: admin.firestore.FieldValue.arrayRemove(userB),
    });
    await db.doc(`users/${userB}`).update({
      friends: admin.firestore.FieldValue.arrayRemove(userA),
    });
    return { success: true };
  }
);