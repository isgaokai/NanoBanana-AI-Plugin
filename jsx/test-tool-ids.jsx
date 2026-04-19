/**
 * 测试所有可能的矩形选框工具ID
 * 在Photoshop的ExtendScript Toolkit中运行这个脚本
 * 或者通过插件调用这个函数
 */

function testRectangleToolIDs() {
    var results = [];
    
    // 所有可能的矩形选框工具名称
    var possibleNames = [
        'rectangleTool',
        'rectangularMarqueeTool',
        'marqueeTool',
        'marquee',
        'rectangularMarquee',
        'rectMarqueeTool',
        'rectTool',
        'rectangleSelectionTool',
        'marqueeRectangular',
        'rectangularSelection',
        'rectangleMarquee',
        'rectSelection',
        'rectangleSelection',
        'rectangularSelectionTool',
        'marqueeRectangle',
        'rectMarquee'
    ];
    
    results.push('=== 测试矩形选框工具ID ===\n');
    results.push('总共测试 ' + possibleNames.length + ' 个名称\n\n');
    
    for (var i = 0; i < possibleNames.length; i++) {
        var name = possibleNames[i];
        results.push((i + 1) + '. 测试: ' + name + '\n');
        
        try {
            // 尝试获取toolID
            var toolID = stringIDToTypeID(name);
            results.push('   ✓ stringIDToTypeID 成功: ' + toolID + '\n');
            
            // 尝试选择工具
            try {
                var desc = new ActionDescriptor();
                var ref = new ActionReference();
                ref.putClass(toolID);
                desc.putReference(charIDToTypeID('null'), ref);
                executeAction(charIDToTypeID('slct'), desc, DialogModes.NO);
                
                results.push('   ✓✓✓ 工具选择成功！这个名称可用！\n');
                results.push('   >>> 推荐使用: ' + name + ' <<<\n');
            } catch (selectError) {
                results.push('   ✗ 选择失败: ' + selectError.message + '\n');
            }
        } catch (typeError) {
            results.push('   ✗ stringIDToTypeID 失败: ' + typeError.message + '\n');
        }
        
        results.push('\n');
    }
    
    results.push('\n=== 测试完成 ===\n');
    results.push('请查看上面标记为 "工具选择成功" 的名称\n');
    
    return results.join('');
}

function testEllipseToolIDs() {
    var results = [];
    
    // 所有可能的椭圆选框工具名称
    var possibleNames = [
        'ellipseTool',
        'ellipticalMarqueeTool',
        'ellipse',
        'ellipticalMarquee',
        'ellipseMarqueeTool',
        'ellipseSelection',
        'ellipticalSelection',
        'ellipticalSelectionTool',
        'marqueeEllipse',
        'marqueeElliptical',
        'ellipseMarquee',
        'ellipticalTool'
    ];
    
    results.push('=== 测试椭圆选框工具ID ===\n');
    results.push('总共测试 ' + possibleNames.length + ' 个名称\n\n');
    
    for (var i = 0; i < possibleNames.length; i++) {
        var name = possibleNames[i];
        results.push((i + 1) + '. 测试: ' + name + '\n');
        
        try {
            var toolID = stringIDToTypeID(name);
            results.push('   ✓ stringIDToTypeID 成功: ' + toolID + '\n');
            
            try {
                var desc = new ActionDescriptor();
                var ref = new ActionReference();
                ref.putClass(toolID);
                desc.putReference(charIDToTypeID('null'), ref);
                executeAction(charIDToTypeID('slct'), desc, DialogModes.NO);
                
                results.push('   ✓✓✓ 工具选择成功！这个名称可用！\n');
                results.push('   >>> 推荐使用: ' + name + ' <<<\n');
            } catch (selectError) {
                results.push('   ✗ 选择失败: ' + selectError.message + '\n');
            }
        } catch (typeError) {
            results.push('   ✗ stringIDToTypeID 失败: ' + typeError.message + '\n');
        }
        
        results.push('\n');
    }
    
    results.push('\n=== 测试完成 ===\n');
    
    return results.join('');
}

// 合并测试函数
function testAllMarqueeTools() {
    var results = [];
    results.push('########################################\n');
    results.push('#   Photoshop 选框工具 ID 测试工具   #\n');
    results.push('########################################\n\n');
    
    results.push(testRectangleToolIDs());
    results.push('\n\n');
    results.push(testEllipseToolIDs());
    
    return results.join('');
}

// 运行测试
var testResults = testAllMarqueeTools();
alert(testResults);
testResults;
