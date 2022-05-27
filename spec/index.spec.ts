import { collection, CollectionReference, doc, getDoc, writeBatch } from 'firebase/firestore';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { FireDocument } from '../src/lib';
import { FireCollection } from '../src/lib';
import { getDb } from './test-setup';
import { clearFirestore } from './test-utils';

// NOTE: Documents
interface UserData {
  name: string;
}
interface UserDoc extends UserData {}
class UserDoc extends FireDocument<UserData> {
  // NOTE: Sub Collection
  postsCollection = new PostCollection(collection(this.ref, 'posts'));

  static create(collection: UsersCollection, id: string | null, data: UserData) {
    return new UserDoc(this.makeConstructorInput(collection, id, data));
  }
}

interface PostData {
  content: string;
}
interface PostDoc extends PostData {}
class PostDoc extends FireDocument<PostData> {
  static create(collection: PostCollection, id: string | null, data: PostData) {
    return new PostDoc(this.makeConstructorInput(collection, id, data));
  }
}

// NOTE: Collections
class UsersCollection extends FireCollection<UserData, UserDoc> {
  constructor(ref: CollectionReference) {
    super(ref, (snap) => new UserDoc(snap));
  }
}

class PostCollection extends FireCollection<PostData, PostDoc> {
  constructor(ref: CollectionReference) {
    super(ref, (snap) => new PostDoc(snap));
  }
}

// NOTE: Root Collections
const usersRef = collection(getDb(), 'users');
const usersCollection = new UsersCollection(usersRef);

beforeEach(async () => {
  await clearFirestore();
});
afterAll(async () => {
  await clearFirestore();
});

describe('Document', () => {
  it('create, edit, save and delete', async () => {
    // NOTE: create -> save
    const user = UserDoc.create(usersCollection, '1', { name: 'Taro' });
    await user.save();

    let gotUser = await getDoc(doc(usersRef, '1'));

    expect(gotUser.data()).toStrictEqual({ name: 'Taro' });

    // NOTE: edit -> save
    user.edit({ name: 'Taro Yamada' });
    await user.save();

    gotUser = await getDoc(doc(usersRef, '1'));

    expect(gotUser.data()).toStrictEqual({ name: 'Taro Yamada' });

    // NOTE: delete
    await user.delete();

    gotUser = await getDoc(doc(usersRef, '1'));

    expect(gotUser.exists()).toBe(false);
  });

  it('batchInput', async () => {
    const user1 = UserDoc.create(usersCollection, '1', { name: 'Taro' });
    const user2 = UserDoc.create(usersCollection, '2', { name: 'Masami' });

    const batch = writeBatch(getDb());

    batch.set(...user1.batchInput);
    batch.set(...user2.batchInput);

    await batch.commit();

    const gotUser1 = await getDoc(doc(usersRef, '1'));
    const gotUser2 = await getDoc(doc(usersRef, '2'));

    expect(gotUser1.data()).toStrictEqual({ name: 'Taro' });
    expect(gotUser2.data()).toStrictEqual({ name: 'Masami' });
  });
});

describe.skip('Collection', () => {
  it('findOne');
  it('findOneById');
  it('findManyByQuery');
});

describe.skip('Sub Collection', () => {
  it('findOne');
  it('findOneById');
  it('findManyByQuery');
});
