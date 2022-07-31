/**
 * 这种代码想必谁都能看懂那就不需要写任何的注释了 
 */

import inquirer from 'inquirer';
import chalk from 'chalk';
import pressAnyKey from 'press-any-key';
import fs from 'fs';
import path from 'path';

var originChart;
var originChartPath;
var newChart;
var settings;

(async () =>
{
    originChartPath = process.argv.slice(2)[0];

    console.log(
        chalk.bold('=================================================') + '\n' +
        chalk.bold('====== ' + chalk.blueBright('臀大肌 DSSQ 器') + ' v1.0 ' + chalk.italic('Made by MisaLiu') + ' ======') + '\n' +
        chalk.bold('=================================================') + '\n'
    );

    console.log('i) 项目初衷见 https://github.com/MisaLiu/phi-dssqer#why' + '\n');

    if (!originChartPath || originChartPath == '')
    {
        console.log(chalk.red.bold('w) 本程序不可直接运行，请将官方谱面文件拖拽至此程序上打开，或是在命令行中传入谱面路径参数给本程序'));
        await pressAnyKey('请按任意键退出程序...');
        process.exit(0);
    }

    console.log('i) 正在解析谱面文件...');

    try
    {
        originChart = JSON.parse(fs.readFileSync(originChartPath));
        if (!originChart.formatVersion)
        {
            throw new Error('Not official chart format');
        }
    }
    catch (e)
    {
        console.log(
            chalk.red.bold(
                'e) 不支持的谱面格式或谱面文件不存在！' + '\n' +
                'e) 请确保传入的谱面文件存在，且为官方格式谱面。'
            )
        );
        await pressAnyKey('请按任意键退出程序...');
        process.exit(0);
    }

    console.log('i) 解析谱面文件完成！' + '\n');
    console.log('===== 欢迎使用 ' + chalk.blueBright.bold('臀大肌 DSSQ 器') + ' ！=====');
    console.log('i) 当前谱面文件：' + chalk.bold(originChartPath) + '\n');

    settings = await inquirer.prompt([
        {
            type    : 'rawlist',
            name    : 'mode',
            message : '请选择 DSSQ 类型：',
            choices : [
                { name: '删除某一类 Note', value: 1 },
                { name: '将所有 Note 替换为某一类 Note', value: 2 }
            ]
        }, {
            type    : 'rawlist',
            name    : 'noteType',
            message : '请选择欲处理的 Note 类型：',
            choices : [
                { name: 'Tap', value: 1 },
                { name: 'Drag', value: 2 },
                { name: 'Hold', value: 3 },
                { name: 'Flick', value: 4 },
            ]
        }, {
            type    : 'confirm',
            name    : 'confirm',
            message : '确认？',
            default : false
        }
    ]);

    console.log('');

    if (!settings || !settings.confirm)
    {
        console.log('i) 请重启程序以再次选择');
        await pressAnyKey('请按任意键退出程序...');
        process.exit(0);
    }

    console.log('i) 开始处理谱面文件...');
    newChart = processChart(originChart, settings.mode, settings.noteType);
    console.log('i) 谱面文件处理完成！');

    console.log('i) 正在保存谱面文件...');
    fs.writeFileSync(path.dirname(originChartPath) + '/' + path.basename(originChartPath, '.json') + '_new.json', JSON.stringify(newChart));
    console.log('i) 保存谱面文件成功！');
    console.log('i) 新的谱面文件已保存为：' + chalk.bold(path.dirname(originChartPath) + '/' + path.basename(originChartPath, '.json') + '_new.json'));

    await pressAnyKey('请按任意键退出程序...');
    process.exit(0);
}
)();

function processChart(originChart, mode = 1, noteType = 1)
{
    let newChart = originChart;
    let newNumOfNotes = 0;

    newChart.judgeLineList.forEach(judgeline =>
    {
        judgeline.notesAbove = processNotes(judgeline.notesAbove, mode, noteType);
        judgeline.notesBelow = processNotes(judgeline.notesBelow, mode, noteType);

        judgeline.numOfNotesAbove = judgeline.notesAbove.length;
        judgeline.numOfNotesBelow = judgeline.notesBelow.length;
        judgeline.numOfNotes = judgeline.numOfNotesAbove + judgeline.numOfNotesBelow;
        newNumOfNotes += judgeline.numOfNotes;
    });

    return newChart;

    function processNotes(_notes, mode = 1, noteType = 1)
    {
        let notes = _notes.slice();
        let noteIndexOffset = 0;

        for (let noteIndex = 0; noteIndex < notes.length; noteIndex++)
        {
            let note = notes[noteIndex - noteIndexOffset];

            switch (mode)
            {
                case 1:
                {
                    if (note.type != noteType) continue;
                    notes.splice(noteIndex - noteIndexOffset, 1);
                    noteIndexOffset++;
                    break;
                }
                case 2:
                {
                    note.type = noteType;
                    notes[noteIndex - noteIndexOffset] = note;
                    break;
                }
            }
        }

        return notes;
    }
}