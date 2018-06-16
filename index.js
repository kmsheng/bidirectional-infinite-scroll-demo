
const box = document.getElementById('box');
const items = genItems(300000);
const itemsMap = items.reduce((obj, item) => {
  obj[item.id] = item;
  return obj;
}, {});

box.innerHTML = items.slice(0, 100)
  .map(item => item.html)
  .join('');

let lastScrollTop;

const topBufferHeight = 1200;
const bottomBufferHeight = 1200;

let isHandlingScrollUp = false;
let isHandlingScrollDown = false;

box.addEventListener('scroll', () => {

  if (isHandlingScrollDown || isHandlingScrollUp) {
    return;
  }

  const isScrollingDown = box.scrollTop > lastScrollTop;
  const scrollBottom = box.scrollTop + box.clientHeight;

  if (isScrollingDown) {
    handleScrollingDown({
      scrollTop: box.scrollTop,
      scrollBottom,
      box
    });
  }
  else {
    handleScrollingUp({
      scrollTop: box.scrollTop,
      scrollBottom,
      box
    });
  }

  lastScrollTop = box.scrollTop;
});

function getTopHiddenNodes({scrollTop, box}) {

  let nodeConcatenatedHeight = 0;

  const nodes = Array.from(box.childNodes)
  const topHiddenNodes = [];

  for (const node of nodes) {
      nodeConcatenatedHeight += node.offsetHeight;
      if (nodeConcatenatedHeight < scrollTop) {
        topHiddenNodes.push(node);
      }
      else {
        return topHiddenNodes;
      }
  }
  return topHiddenNodes;
}

function getBottomHiddenNodes({scrollBottom, box}) {

  let nodeConcatenatedHeight = 0;

  const nodes = Array.from(box.childNodes)
  const bottomHiddenNodes = [];

  for (const node of nodes) {
      nodeConcatenatedHeight += node.offsetHeight;
      if (nodeConcatenatedHeight > scrollBottom) {
        bottomHiddenNodes.push(node);
      }
  }
  return bottomHiddenNodes;
}

function removeTopNodesByDelta(nodes, delta) {
  let nodeConcatenatedHeight = 0;
  for (const node of nodes) {
    nodeConcatenatedHeight += node.offsetHeight;
    if (nodeConcatenatedHeight <= delta) {
      node.remove();
    }
    return;
  }
}

function addBottomNodesByDelta(box, delta) {

  const itemsToAdd = [];
  const lastNode = box.childNodes[box.childNodes.length - 1];
  const id = parseInt(lastNode.id.match(/^node-(\d+)$/)[1], 10);
  const slicedItems = items.slice(id + 1);

  let itemConcatenatedHeight = 0;

  for (const item of slicedItems) {
    itemConcatenatedHeight += item.height;
    if (itemConcatenatedHeight <= delta) {
      itemsToAdd.push(item);
    }
    else {
      break;
    }
  }
  if (itemsToAdd.length > 0) {
    const html = itemsToAdd.map(item => item.html)
      .join('');
    box.insertAdjacentHTML('beforeend', html);
  }
}

function addTopNodesByDelta(box, delta, scrollTop) {

  const itemsToAdd = [];
  const firstNode = box.childNodes[0];
  const id = parseInt(firstNode.id.match(/^node-(\d+)$/)[1], 10);
  const slicedItems = items.slice(0, id).reverse();

  let itemConcatenatedHeight = 0;

  for (const item of slicedItems) {
    itemConcatenatedHeight += item.height;
    if (itemConcatenatedHeight <= delta) {
      itemsToAdd.unshift(item);
    }
    else {
      break;
    }
  }
  if (itemsToAdd.length > 0) {
    const html = itemsToAdd.map(item => item.html)
      .join('');
    box.insertAdjacentHTML('afterbegin', html);
  }
}

function handleScrollingDown({scrollTop, scrollBottom, box}) {

  if (isHandlingScrollDown) {
    return;
  }

  isHandlingScrollDown = true;

  const topHiddenNodes = getTopHiddenNodes({scrollTop, box});
  const topHiddenHeight = topHiddenNodes.reduce((total, node) => total + node.offsetHeight, 0);

  if (topHiddenHeight > topBufferHeight) {
    const delta = topHiddenHeight - topBufferHeight;
    removeTopNodesByDelta(topHiddenNodes, delta);
  }

  const bottomHiddenNodes = getBottomHiddenNodes({scrollBottom, box});
  const bottomHiddenHeight = bottomHiddenNodes.reduce((total, node) => total + node.offsetHeight, 0);

  if (bottomHiddenHeight < bottomBufferHeight) {
    const delta = bottomBufferHeight - bottomHiddenHeight;
    addBottomNodesByDelta(box, delta);
  }

  isHandlingScrollDown = false;
}

function removeBottomNodesByDelta(nodes, delta) {
  let nodeConcatenatedHeight = 0;
  const reversedNodes = nodes.reverse();
  for (const node of reversedNodes) {
    nodeConcatenatedHeight += node.offsetHeight;
    if (nodeConcatenatedHeight <= delta) {
      node.remove();
    }
    return;
  }
}

function handleScrollingUp({scrollTop, scrollBottom, box}) {

  if (isHandlingScrollUp) {
    return;
  }

  isHandlingScrollUp = true;

  const topHiddenNodes = getTopHiddenNodes({scrollTop, box});
  const topHiddenHeight = topHiddenNodes.reduce((total, node) => total + node.offsetHeight, 0);

  if (topHiddenHeight < topBufferHeight) {
    const delta = topBufferHeight - topHiddenHeight;
    addTopNodesByDelta(box, delta, scrollTop);
  }

  const bottomHiddenNodes = getBottomHiddenNodes({scrollBottom, box});
  const bottomHiddenHeight = bottomHiddenNodes.reduce((total, node) => total + node.offsetHeight, 0);

  if (bottomHiddenHeight > bottomBufferHeight) {
    const delta = bottomHiddenHeight - bottomBufferHeight;
    removeBottomNodesByDelta(bottomHiddenNodes, delta);
  }
  isHandlingScrollUp = false;
}

function genItems(count) {

  return new Array(count).fill()
    .map((value, index) => {

      const height = getRandomHeight();
      const color = getColorByHeight(height);
      const style = genStyleStr({
        'height': `${height}px`,
        'line-height': `${height}px`,
        'border': `1px solid ${color}`
      });

      const message = `index: ${index} height: ${height}px`;

      return {
        id: index,
        height,
        text: `This is node ${index}`,
        html: `<div id="node-${index}" class="box__item" data-id="${index}" style="${style}">${message}</div>`
      };
    });
}

function getColorByHeight(height) {
  const obj = {
    50: '#c0392b',
    80: '#27ae60',
    100: '#2980b9'
  };
  return obj[height];
}

function genStyleStr(obj) {
  return Object.keys(obj)
    .map((key) => {
      return `${key}: ${obj[key]}`;
    })
    .join(';');
}

function getRandomHeight() {
  const heights = [50, 80, 100];
  return heights[Math.floor(Math.random() * heights.length)];
  }
