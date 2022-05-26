import { collection, CollectionReference, getDoc, Timestamp } from 'firebase/firestore';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { FireDocument } from '../src/lib';
import { FireCollection } from '../src/lib';
import { getDb } from './test-setup';
import { clearFirestore } from './test-utils';

const usersRef = collection(getDb(), 'users');

interface UserData {
  name: string;
  createdAt: Timestamp;
}
interface UserDoc extends UserData {}
class UserDoc extends FireDocument<UserData> {
  static create(collection: UsersCollection, data: UserData) {
    return new UserDoc(this.makeConstructorInput(collection, null, data));
  }
}

class UsersCollection extends FireCollection<UserData, UserDoc> {
  constructor(ref: CollectionReference) {
    super(ref, (snap) => new UserDoc(snap));
  }
}

const usersCollection = new UsersCollection(usersRef);

beforeEach(async () => {
  await clearFirestore();
});
afterAll(async () => {
  await clearFirestore();
});

describe('Document', () => {
  it('create and save', async () => {
    const user = await UserDoc.create(usersCollection, {
      name: 'Taro',
      createdAt: Timestamp.now(),
    });

    await user.save();

    const gotUser = await getDoc(user.ref);

    expect(gotUser.data()).toStrictEqual(user.data);
  });
});
