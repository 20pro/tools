import Q from '../index';
import * as QueueActionTypes from '../action-types';

let queue = [];
let createQueueAction = {type: 'CREATE', meta: {offline: {queue: {method: QueueActionTypes.CREATE, key: '1'}}}};
let createQueueAction2 = {type: 'CREATE2', meta: {offline: {queue: {method: QueueActionTypes.CREATE, key: '2'}}}};
let createQueueAction3 = {type: 'CREATE3', meta: {offline: {queue: {method: QueueActionTypes.CREATE, key: '3'}}}};
let updateQueueAction = {type: 'UPDATE', meta: {offline: {queue: {method: QueueActionTypes.UPDATE, key: '1'}}}};
let updateQueueAction2 = {type: 'UPDATE2', meta: {offline: {queue: {method: QueueActionTypes.UPDATE, key: '2'}}}};
let updateNonExistingQueueAction = {type: 'Non-Existing', meta: {offline: {queue: {method: QueueActionTypes.UPDATE, key: '-1'}}}};
let deleteQueueAction = {type: 'DELETE', meta: {offline: {queue: {method: QueueActionTypes.DELETE, key: '1'}}}};
let deleteQueueAction2 = {type: 'DELETE2', meta: {offline: {queue: {method: QueueActionTypes.DELETE, key: '2'}}}};
let deleteNonExistingQueueAction = {type: 'NON-Existing', meta: {offline: {queue: {method: QueueActionTypes.DELETE, key: '-1'}}}};
let readQueueAction = {type: 'READ', meta: {offline: {queue: {method: QueueActionTypes.READ, key: '1'}}}};
let readQueueAction2 = {type: 'READ2', meta: {offline: {queue: {method: QueueActionTypes.READ, key: '2'}}}};
let missingActionMethod = {type: 'MISSING-METHOD', meta: {offline: {queue: {method: null, key: '2'}}}};
let missingActionKey = {type: 'MISSING-KEY', meta: {offline: {queue: {method: QueueActionTypes.CREATE, key: null}}}};

beforeEach(() => {
  queue = [];
});
// create single item
test('Single insertion test', () => {
  queue = Q.enqueue(queue, createQueueAction);
  expect(queue.length).toBe(1);
});

// create then update same item
test(
  'Create then update same item', () => {
    queue = Q.enqueue(queue, createQueueAction);
    queue = Q.enqueue(queue, updateQueueAction);
    expect(queue.length).toBe(1);
    expect(Q.peek(queue).type).toBe('UPDATE');
  }
);

test(
  'Create then update then delete same item', () => {
    queue = Q.enqueue(queue, createQueueAction);
    queue = Q.enqueue(queue, updateQueueAction);
    queue = Q.enqueue(queue, deleteQueueAction);
    expect(queue.length).toBe(0);
  }
);

test('Insert then read', () => {
  queue = Q.enqueue(queue, createQueueAction);
  expect(Q.peek(queue).meta.offline.queue.key).toBe('1');
});

test('Insert -> update then read', () => {
  queue = Q.enqueue(queue, createQueueAction);
  queue = Q.enqueue(queue, updateQueueAction);
  expect(Q.peek(queue).meta.offline.queue.key).toBe('1');
  expect(Q.peek(queue).type).toBe('UPDATE');
});

test('Multiple create with same key', () => {
  queue = Q.enqueue(queue, createQueueAction);
  queue = Q.enqueue(queue, createQueueAction);
  queue = Q.enqueue(queue, createQueueAction);
  expect(queue.length).toBe(1);
});

test('Multiple create with different keys', () => {
  queue = Q.enqueue(queue, createQueueAction);
  queue = Q.enqueue(queue, createQueueAction2);
  queue = Q.enqueue(queue, createQueueAction3);
  expect(queue.length).toBe(3);
  expect(Q.peek(queue).type).toBe('CREATE');
  queue = Q.dequeue(queue);
  expect(Q.peek(queue).type).toBe('CREATE2');
  queue = Q.dequeue(queue);
  expect(Q.peek(queue).type).toBe('CREATE3');
});

test('Multiple create with same key followed by delete', () => {
  queue = Q.enqueue(queue, createQueueAction);
  queue = Q.enqueue(queue, createQueueAction);
  queue = Q.enqueue(queue, createQueueAction);
  const item = Q.peek(queue);
  expect(item.type).toBe('CREATE');
  expect(queue.length).toBe(1);
  queue = Q.enqueue(queue, deleteQueueAction);
  expect(queue.length).toBe(0);
});

test('Multiple create with different key followed by delete', () => {
  queue = Q.enqueue(queue, createQueueAction);
  queue = Q.enqueue(queue, createQueueAction2);
  queue = Q.enqueue(queue, createQueueAction3);
  queue = Q.enqueue(queue, deleteQueueAction2);
  expect(queue.length).toBe(2);
});

test('Multiple create with different key followed by delete and 2 peek', () => {
  queue = Q.enqueue(queue, createQueueAction);
  queue = Q.enqueue(queue, createQueueAction2);
  queue = Q.enqueue(queue, createQueueAction3);
  queue = Q.enqueue(queue, deleteQueueAction2);
  const firstItem = Q.peek(queue);
  queue = Q.dequeue(queue);
  const thirdItem = Q.peek(queue);
  expect(firstItem.type).toBe('CREATE');
  expect(thirdItem.type).toBe('CREATE3');
});

test('2 creates followed by update of first item', () => {
  queue = Q.enqueue(queue, createQueueAction);
  queue = Q.enqueue(queue, createQueueAction2);
  queue = Q.enqueue(queue, updateQueueAction);
  const firstItem = Q.peek(queue);
  queue = Q.dequeue(queue);
  const thirdItem = Q.peek(queue);
  expect(firstItem.type).toBe('UPDATE');
  expect(thirdItem.type).toBe('CREATE2');
});

test('2 creates followed by update of second item', () => {
  queue = Q.enqueue(queue, createQueueAction);
  queue = Q.enqueue(queue, createQueueAction2);
  queue = Q.enqueue(queue, updateQueueAction2);
  const firstItem = Q.peek(queue);
  queue = Q.dequeue(queue);
  const thirdItem = Q.peek(queue);
  expect(firstItem.type).toBe('CREATE');
  expect(thirdItem.type).toBe('UPDATE2');
});

test('2 reads', () => {
  queue = Q.enqueue(queue, readQueueAction);
  queue = Q.enqueue(queue, readQueueAction2);
  const firstItem = Q.peek(queue);
  queue = Q.dequeue(queue);
  const thirdItem = Q.peek(queue);
  expect(firstItem.type).toBe('READ');
  expect(thirdItem.type).toBe('READ2');
});

test('Delete non-existing queue actions', () => {
  queue = Q.enqueue(queue, createQueueAction);
  queue = Q.enqueue(queue, createQueueAction2);
  queue = Q.enqueue(queue, deleteNonExistingQueueAction);
  const firstItem = Q.peek(queue);
  queue = Q.dequeue(queue);
  const thirdItem = Q.peek(queue);
  expect(firstItem.type).toBe('CREATE');
  expect(thirdItem.type).toBe('CREATE2');
});

test('Update non-existing queue actions', () => {
  queue = Q.enqueue(queue, createQueueAction);
  queue = Q.enqueue(queue, createQueueAction2);
  queue = Q.enqueue(queue, updateNonExistingQueueAction);
  const firstItem = Q.peek(queue);
  queue = Q.dequeue(queue);
  const thirdItem = Q.peek(queue);
  expect(firstItem.type).toBe('CREATE');
  expect(thirdItem.type).toBe('CREATE2');
});

test('Missing action method', () => {
  queue = Q.enqueue(queue, createQueueAction);
  queue = Q.enqueue(queue, createQueueAction2);
  queue = Q.enqueue(queue, missingActionMethod);
  expect(queue.length).toBe(2);
  const firstItem = Q.peek(queue);
  queue = Q.dequeue(queue);
  const thirdItem = Q.peek(queue);
  expect(firstItem.type).toBe('CREATE');
  expect(thirdItem.type).toBe('CREATE2');
});

test('Missing action key', () => {
  queue = Q.enqueue(queue, createQueueAction);
  queue = Q.enqueue(queue, createQueueAction2);
  queue = Q.enqueue(queue, missingActionKey);
  expect(queue.length).toBe(2);
  const firstItem = Q.peek(queue);
  queue = Q.dequeue(queue);
  const thirdItem = Q.peek(queue);
  expect(firstItem.type).toBe('CREATE');
  expect(thirdItem.type).toBe('CREATE2');
});