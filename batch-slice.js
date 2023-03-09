
// 以下是分批执行例子，并不是并发执行。
// 分批切片处理的话，当前片如果存在较长的时间处理时，那么就不会进行下一步的处理。
(async function () {

    const asyncFn = (v, d) => {
        return new Promise(resolve => {
            console.log('message: ' + v);
            setTimeout(() => {
                resolve(v);
            }, d * 1e3);
        })
    };

    const asyncArr = [
        () => asyncFn('a_2', 2),
        () => asyncFn('a_3', 3),
        () => asyncFn('a_1', 1),
        () => asyncFn('b_4', 2),
        () => asyncFn('b_3', 3),
        () => asyncFn('c_1', 1),
        () => asyncFn('c_2', 2),
    ];

    const limit = 2;
    let len = 0;
    const start = Date.now();
    while (len < asyncArr.length) {
        const runArr = asyncArr.slice(len, len + limit);
        const res = await Promise.all(
            runArr.map(async (fn) => {
                try {
                    return await fn();
                } catch { }
            })
        );
        console.log('res: ', res);
        len += limit;
    }
    console.log('切片控制 finish: ', Date.now() - start, 'ms');

})();