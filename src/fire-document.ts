import {
  CollectionReference,
  deleteDoc,
  doc,
  DocumentReference,
  DocumentSnapshot,
  PartialWithFieldValue,
  setDoc,
} from 'firebase/firestore';

import { FireCollection } from './fire-collection';

export type FireDocumentInput<TData> = Pick<DocumentSnapshot<TData>, 'id' | 'ref' | 'data'>;

export class FireDocument<TData> {
  id: string;
  ref: DocumentReference<TData>;

  constructor(snap: FireDocumentInput<TData>) {
    this.id = snap.id;
    this.ref = snap.ref;

    const data = snap.data();
    Object.assign(this, data);
  }

  get data() {
    const { id, ref, ...restFields } = this;
    const data = Object.fromEntries(
      Object.entries(restFields).filter(([, v]) => (v instanceof FireCollection ? false : true))
    );
    return data as unknown as TData;
  }

  get batchInput() {
    return [this.ref, this.data] as const;
  }

  static makeCreateInput<TData>(
    collection: { ref: CollectionReference<TData> },
    id: null | string,
    data: TData
  ): FireDocumentInput<TData> {
    const docRef = id ? doc(collection.ref, id) : doc(collection.ref);
    return {
      ref: docRef,
      id: docRef.id,
      data: () => data,
    };
  }

  edit(data: PartialWithFieldValue<TData>) {
    Object.assign(this, data);
    return this;
  }

  async save() {
    await setDoc(this.ref, this.data);
    return this;
  }

  async delete() {
    await deleteDoc(this.ref);
    return this;
  }
}
