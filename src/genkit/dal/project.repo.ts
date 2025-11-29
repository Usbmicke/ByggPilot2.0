import 'server-only';
import { adminFirestore } from '@/genkit/firebase';

const projectCollection = adminFirestore.collection('projects');

async function get(projectId: string) {
  const projectRef = projectCollection.doc(projectId);
  const projectDoc = await projectRef.get();
  return projectDoc.data();
}

async function getAll() {
  const snapshot = await projectCollection.get();
  return snapshot.docs.map(doc => doc.data());
}

export { get, getAll };
