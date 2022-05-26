import {
  CollectionReference,
  doc,
  DocumentReference,
  getDoc,
  getDocs,
  Query,
  query,
} from 'firebase/firestore';

import { FireDocumentInput } from './fire-document';

export class FireCollection<TData, TTransformed> {
  ref: CollectionReference<TData>;
  transformer: (snap: FireDocumentInput<TData>) => TTransformed;

  constructor(
    ref: CollectionReference,
    transformer: (snap: FireDocumentInput<TData>) => TTransformed
  ) {
    this.ref = ref as CollectionReference<TData>;
    this.transformer = transformer;
  }

  async findOne(id: string) {
    const snap = await getDoc(doc(this.ref, id));
    if (!snap.exists() || !snap.data()) throw new Error("Can't findOne");
    return this.transformer({
      id: snap.id,
      ref: snap.ref as DocumentReference<TData>,
      data: () => snap.data() as TData,
    });
  }

  async findOneById(id: string) {
    const snap = await getDoc(doc(this.ref, id));
    if (!snap.exists() || !snap.data()) return undefined;
    return this.transformer({
      id: snap.id,
      ref: snap.ref as DocumentReference<TData>,
      data: () => snap.data() as TData,
    });
  }

  async findManyByQuery(queryFn: (ref: CollectionReference<TData>) => Query<TData>) {
    const snap = await getDocs(query(queryFn(this.ref)));
    return snap.docs.map(this.transformer);
  }
}
