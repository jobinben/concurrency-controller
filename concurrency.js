// 并发控制器

// 方法1: 函数式实现
const ConcurrencyController = function (maxConcurrency) {

    let runningCount = 0; // 当前运行数
    let queue = []; // 任务队列

    // 5. 执行下一个任务
    const nextTask = () => {
        runningCount--;

        if (queue.length > 0) {
            const task = queue.shift();
            task();
        }
    }

    // 4. 开始跑任务
    const runTask = async (fn, args, resolve) => {
        runningCount++;

        const result = (async () => fn(...args))();
        resolve(result);

        try {
            await result;
        } catch {

        }

        nextTask();
    }

    // 2. 入队，等待执行
    const enqueue = (fn, args, resolve) => {
        queue.push(runTask.bind(null, fn, args, resolve));

        (async () => {
            // 该微任务是用来等待，所有任务（fn）进入队列后， 再开始执行
            await Promise.resolve();
            // 3. 当前满足条件，可以先执行任务
            if (runningCount < maxConcurrency && queue.length > 0) {
                const task = queue.shift();
                task();
            }
        })()

    }


    // 1. 收集任务并返回一个Promise
    const generator = function (fn, ...args) {
        return new Promise((resolve) => {
            enqueue(fn, args, resolve);
        })
    }

    // 6. 增加一些可读属性
    Object.defineProperties(generator, {
        runningCount: {
            get: () => runningCount,
        },
        queueSize: {
            get: () => queue.length,
        },
        clearQueue: {
            value: () => {
                queue = [];
            }
        }
    })


    return generator;
}

// test:
const cc = ConcurrencyController(2);

(async () => {
    const asyncFn = (v, d) => {
        return new Promise(resolve => {
            console.log('message: ', v, 'running: ', cc.runningCount, 'queue size: ', cc.queueSize);
            setTimeout(() => {
                resolve(v);
            }, d * 1e3);
        })
    };
    const asyncArr = [
        cc(() => asyncFn('a_3', 3)),
        cc(() => asyncFn('a_2', 2)),
        cc(() => asyncFn('b_1', 1)),
        cc(() => asyncFn('b_2', 2)),
        cc(() => asyncFn('c_2', 2)),
        cc(() => asyncFn('c_2', 3)),
        cc(() => asyncFn('d_3', 1)),
    ];
    // const start = Date.now();
    // const asyncArr = [
    //     cc(() => asyncFn('a_2', 2)),
    //     cc(() => asyncFn('a_3', 3)),
    //     cc(() => asyncFn('a_1', 1)),
    //     cc(() => asyncFn('b_4', 2)),
    //     cc(() => asyncFn('b_3', 3)),
    //     cc(() => asyncFn('c_1', 1)),
    //     cc(() => asyncFn('c_2', 2)),
    // ];

    const res = await Promise.all(asyncArr);
    // console.log('并发控制 finish: ', Date.now() - start, 'ms');

    console.log('res: ', res);
})();