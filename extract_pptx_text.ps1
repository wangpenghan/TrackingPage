$ErrorActionPreference = "Stop"

# 加载PowerPoint应用程序
Add-Type -AssemblyName Microsoft.Office.Interop.PowerPoint

$pptPath = "d:\TraeProject\TrackingPage\.trae\documents\PPT---参考样例.pptx"
$outputPath = "d:\TraeProject\TrackingPage\ppt_template_content.txt"

# 创建PowerPoint应用实例
$pptApp = New-Object -ComObject PowerPoint.Application
$pptApp.Visible = [Microsoft.Office.Core.MsoTriState]::msoFalse

try {
    # 打开PPT文件
    $presentation = $pptApp.Presentations.Open($pptPath, [Microsoft.Office.Core.MsoTriState]::msoFalse, [Microsoft.Office.Core.MsoTriState]::msoFalse, [Microsoft.Office.Core.MsoTriState]::msoFalse)
    
    $outputContent = @()
    $outputContent += "=== PPT模板结构分析 ==="
    $outputContent += "总幻灯片数: $($presentation.Slides.Count)"
    $outputContent += "`n"

    # 遍历每一页幻灯片
    for ($i = 1; $i -le $presentation.Slides.Count; $i++) {
        $slide = $presentation.Slides.Item($i)
        $outputContent += "=== 第 $i 页幻灯片 ==="
        $outputContent += "布局名称: $($slide.CustomLayout.Name)"
        $outputContent += "`n内容:"
        
        # 遍历所有形状提取文本
        foreach ($shape in $slide.Shapes) {
            if ($shape.HasTextFrame -eq [Microsoft.Office.Core.MsoTriState]::msoTrue -and $shape.TextFrame.HasText -eq [Microsoft.Office.Core.MsoTriState]::msoTrue) {
                $text = $shape.TextFrame.TextRange.Text.Trim()
                if ($text -ne "") {
                    $outputContent += "- $text"
                }
            }
        }
        $outputContent += "`n"
    }

    # 保存输出内容
    $outputContent | Out-File -FilePath $outputPath -Encoding UTF8
    Write-Host "PPT模板内容已提取到: $outputPath"
}
catch {
    Write-Host "提取过程发生错误: $_"
    throw
}
finally {
    # 关闭PPT并释放资源
    if ($presentation) {
        $presentation.Close()
        [System.Runtime.Interopservices.Marshal]::ReleaseComObject($presentation) | Out-Null
    }
    $pptApp.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($pptApp) | Out-Null
    [System.GC]::Collect()
    [System.GC]::WaitForPendingFinalizers()
}
