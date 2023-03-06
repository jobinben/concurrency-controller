// 并发控制器

// 方法2: 类实现

class ConcurrencyController {
    constructor(max) {
        this.max = max;
        this.queue = [];
        this.runningCount = 0;
    }

    nextTask() {
        this.runningCount--;

        if (this.queue.length > 0) {
            const task = this.queue.shift();
            task();
        }
    }

    async run(fn, args, resolve) {
        this.runningCount++;

        const result = (async () => fn(...args))();
        resolve(result);

        try {
            await result;
        } catch {

        };
        this.nextTask();
    }

    enqueue(fn, args, resolve) {
        this.queue.push(this.run.bind(this, fn, args, resolve));

        (async () => {
            await Promise.resolve();
            if (this.runningCount < this.max && this.queue.length > 0) {
                const task = this.queue.shift();
                task();
            }
        })();
    }

    // 1. 生成Promise并入队
    add(fn, ...args) {
        return new Promise((resolve) => {
            this.enqueue(fn, args, resolve);
        });
    }

    size() {
        return this.queue.length;
    }

    executeCount () {
        return this.runningCount;
    }

}


// test:

const cc = new ConcurrencyController(2);

(async () => {
    const asyncFn = (v, d) => {
        return new Promise(resolve => {
            console.log('message: ', v, 'execuete count: ', cc.executeCount(), 'queue size: ', cc.size());
            setTimeout(() => {
                resolve(v);
            }, d * 1e3);
        })
    };
    const asyncArr = [
        cc.add(() => asyncFn('a_3', 3)),
        cc.add(() => asyncFn('a_2', 2)),
        cc.add(() => asyncFn('b_1', 1)),
        cc.add(() => asyncFn('b_2', 2)),
        cc.add(() => asyncFn('c_2', 2)),
        cc.add(() => asyncFn('c_2', 3)),
        cc.add(() => asyncFn('d_3', 1)),
    ];

    const res = await Promise.all(asyncArr);

    console.log('res: ', res);
})();