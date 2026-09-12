# 制作一份地图配置文件

## 大小为 15 * 15 的方格地图

   "size":15

## 节点结构如下

    {
        "idx": 0,
        "data": {
            "position": {
                "x": 0,
                "y": 0,
                "z": 0
            }
        }
    }

## 边的结果如下

    {
        "from": 0,
        "to": 0,
        "cost": 1
    }

## 每条边消耗的计算 to 节点 position 减去 from 节点 position 的模

## 每个方格只和周边8个方格有边

## 制作出的地图文件以 json 文件格式保存到 /Users/myerselee/work_space/git_hub/tea/assets/graph/map.json 文件中
