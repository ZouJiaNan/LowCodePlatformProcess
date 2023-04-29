<template>
  <div id="container">
    <div id="stencil"></div>
    <div id="graph-container"></div>
    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="showModal = false">&times;</span>
        <p>请输入参数：</p>
        图片：<input type="text" v-model="inputParam1"/>
        宽度：<input type="text" v-model="inputParam2"/>
        高度: <input type="text" v-model="inputParam3"/>
        <button @click="saveParam">确定</button>
      </div>
    </div>
  </div>
</template>

<script>
import { Graph, Shape, Addon } from "@antv/x6";
import insertCss from "insert-css";
import axios from "axios";
import { template } from "@antv/x6/lib/util/string/string";
import { groupBy } from "@antv/x6/lib/util/array/array";

export default {
  data() {
    return {
      showModal: false,
      //当前选中的节点
      selectedNode: null,
      //输入框输入的参数
      inputParam1: "",
      inputParam2:"",
      inputParam3:"",
      gra: null,
    };
  },
  mounted() {
    //导入测试
    // const graph = new Graph({container: document.getElementById("graph-container")});
    // graph.fromJSON([
    //   {
    //     id: "node1",
    //     x: 40,
    //     y: 40,
    //     width: 100,
    //     height: 40,
    //     label: "Hello",
    //     shape: "rect",
    //   },
    //   {
    //     id: "node2",
    //     x: 40,
    //     y: 40,
    //     width: 100,
    //     height: 40,
    //     label: "Hello",
    //     shape: "ellipse",
    //   },
    //   {
    //     id: "edge1",
    //     source: "node1",
    //     target: "node2",
    //     shape: "edge",
    //   },
    // ]);

    // #region 初始化画布
    const graph = new Graph({
      container: document.getElementById("graph-container"),
      selecting: true,
      grid: true,
      mousewheel: {
        enabled: true,
        zoomAtMousePosition: true,
        modifiers: "ctrl",
        minScale: 0.5,
        maxScale: 3,
      },
      connecting: {
        router: {
          name: "manhattan",
          args: {
            padding: 1,
          },
        },
        connector: {
          name: "rounded",
          args: {
            radius: 8,
          },
        },
        anchor: "center",
        connectionPoint: "anchor",
        allowBlank: false,
        snap: {
          radius: 20,
        },
        createEdge() {
          return new Shape.Edge({
            attrs: {
              line: {
                stroke: "#A2B1C3",
                strokeWidth: 2,
                targetMarker: {
                  name: "block",
                  width: 12,
                  height: 8,
                },
              },
            },
            zIndex: 0,
          });
        },
        validateConnection({ targetMagnet }) {
          return !!targetMagnet;
        },
      },
      highlighting: {
        magnetAdsorbed: {
          name: "stroke",
          args: {
            attrs: {
              fill: "#5F95FF",
              stroke: "#5F95FF",
            },
          },
        },
      },
      resizing: true,
      rotating: true,
      selecting: {
        enabled: true,
        rubberband: true,
        showNodeSelectionBox: true,
      },
      snapline: true,
      keyboard: true,
      clipboard: true,
    });
    // #endregion
    //捕获节点点击事件
    graph.on("node:click", ({ e, x, y, cell, view }) => {
      this.selectedNode = cell;
      //判断被点击节点的类型,如果是开始节点，才会发起请求
      if (cell.label == "开始") {
        //获取所有节点间的连线关系
        var dataStr = "";
        graph.getEdges().forEach((edge) => {
          //graph.getCellById(edge.target.cell).attr('text/text')
          const startNode = graph.getCellById(edge.source.cell);
          const startNodeName = startNode.attr("text/text");
          const startNodeIndex = startNode.zIndex;

          const endNode = graph.getCellById(edge.target.cell);
          const endNodeName = endNode.attr("text/text");
          const endNodeIndex = endNode.zIndex;

          //处理开始节点的参数
          if (cell.label == "开始") {
            cell.prop("attrs/data/data1", 0);
            cell.prop("attrs/data/data2", 0);
            cell.prop("attrs/data/data3", 0);
          }

          //处理结束节点
          if (cell.label == "结束") {
            cell.prop("attrs/data/data1", 0);
            cell.prop("attrs/data/data2", 0);
            cell.prop("attrs/data/data3", 0);
          }

          dataStr =
            dataStr +
            "@" +
            startNodeIndex +
            "-" +
            startNodeName +
            "," +
            startNode.prop("attrs/data/data1") +
            "," +
            startNode.prop("attrs/data/data2") +
            "," +
            startNode.prop("attrs/data/data3") +
            "_" +
            endNodeIndex +
            "-" +
            endNodeName +
            "," +
            endNode.prop("attrs/data/data1")
            "," +
            endNode.prop("attrs/data/data2")
            "," +
            endNode.prop("attrs/data/data3")
            ;
        });

        e.stopPropagation();

        //使用Axios库发送请求到后端API
        axios
          .get("http://127.0.0.1:8081/test/start", {
            params: {
              data: dataStr,
            },
          })
          .then((response) => {
            console.log(response.data);
          });
      }

      if (cell.label == "过程") {
        this.showModal = true;
      }
    });

    // #region 初始化 stencil
    const stencil = new Addon.Stencil({
      title: "流程图",
      target: graph,
      stencilGraphWidth: 200,
      stencilGraphHeight: 500,
      collapsable: true,
      groups: [
        {
          title: "基础流程图",
          name: "group1",
        },
      ],
    });
    document.getElementById("stencil").appendChild(stencil.container);
    // #endregion

    // 控制连接桩显示/隐藏
    const showPorts = (ports, show) => {
      for (let i = 0, len = ports.length; i < len; i = i + 1) {
        ports[i].style.visibility = show ? "visible" : "hidden";
      }
    };
    graph.on("node:mouseenter", () => {
      const container = document.getElementById("graph-container");
      const ports = container.querySelectorAll(".x6-port-body");
      showPorts(ports, true);
    });
    graph.on("node:mouseleave", () => {
      const container = document.getElementById("graph-container");
      const ports = container.querySelectorAll(".x6-port-body");
      showPorts(ports, false);
    });
    // #endregion

    // #region 初始化图形
    const ports = {
      groups: {
        top: {
          position: "top",
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: "#5F95FF",
              strokeWidth: 1,
              fill: "#fff",
              style: {
                visibility: "hidden",
              },
            },
          },
        },
        right: {
          position: "right",
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: "#5F95FF",
              strokeWidth: 1,
              fill: "#fff",
              style: {
                visibility: "hidden",
              },
            },
          },
        },
        bottom: {
          position: "bottom",
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: "#5F95FF",
              strokeWidth: 1,
              fill: "#fff",
              style: {
                visibility: "hidden",
              },
            },
          },
        },
        left: {
          position: "left",
          attrs: {
            circle: {
              r: 4,
              magnet: true,
              stroke: "#5F95FF",
              strokeWidth: 1,
              fill: "#fff",
              style: {
                visibility: "hidden",
              },
            },
          },
        },
      },
      items: [
        {
          group: "top",
        },
        {
          group: "right",
        },
        {
          group: "bottom",
        },
        {
          group: "left",
        },
      ],
    };

    Graph.registerNode(
      "custom-rect",
      {
        inherit: "rect",
        width: 66,
        height: 36,
        attrs: {
          body: {
            strokeWidth: 1,
            stroke: "#5F95FF",
            fill: "#EFF4FF",
          },
          text: {
            fontSize: 12,
            fill: "#262626",
          },
        },
        ports: { ...ports },
      },
      true
    );

    Graph.registerNode(
      "custom-polygon",
      {
        inherit: "polygon",
        width: 66,
        height: 36,
        attrs: {
          body: {
            strokeWidth: 1,
            stroke: "#5F95FF",
            fill: "#EFF4FF",
          },
          text: {
            fontSize: 12,
            fill: "#262626",
          },
        },
        ports: {
          ...ports,
          items: [
            {
              group: "top",
            },
            {
              group: "bottom",
            },
          ],
        },
      },
      true
    );

    Graph.registerNode(
      "custom-circle",
      {
        inherit: "circle",
        width: 45,
        height: 45,
        attrs: {
          body: {
            strokeWidth: 1,
            stroke: "#5F95FF",
            fill: "#EFF4FF",
          },
          text: {
            fontSize: 12,
            fill: "#262626",
          },
        },
        ports: { ...ports },
      },
      true
    );

    Graph.registerNode(
      "custom-image",
      {
        inherit: "rect",
        width: 52,
        height: 52,
        markup: [
          {
            tagName: "rect",
            selector: "body",
          },
          {
            tagName: "image",
          },
          {
            tagName: "text",
            selector: "label",
          },
        ],
        attrs: {
          body: {
            stroke: "#5F95FF",
            fill: "#5F95FF",
          },
          image: {
            width: 26,
            height: 26,
            refX: 13,
            refY: 16,
          },
          label: {
            refX: 3,
            refY: 2,
            textAnchor: "left",
            textVerticalAnchor: "top",
            fontSize: 12,
            fill: "#fff",
          },
        },
        ports: { ...ports },
      },
      true
    );

    const r1 = graph.createNode({
      shape: "custom-rect",
      label: "开始",
      attrs: {
        body: {
          rx: 20,
          ry: 26,
        },
      },
    });
    
    const r7 = graph.createNode({
      shape: "custom-rect",
      label: "结束",
      attrs: {
        body: {
          rx: 20,
          ry: 26,
        },
      },
    });

    const r2 = graph.createNode({
      shape: "custom-rect",
      label: "过程",
      //用于存储数据的字段
      attrs: {
        data: {
          data1: "value1",
          data2: "value2",
          data3: "value3",
        },
      },
    });
    const r3 = graph.createNode({
      shape: "custom-rect",
      attrs: {
        body: {
          rx: 6,
          ry: 6,
        },
      },
      label: "可选过程",
    });
    const r4 = graph.createNode({
      shape: "custom-polygon",
      attrs: {
        body: {
          refPoints: "0,10 10,0 20,10 10,20",
        },
      },
      label: "决策",
    });
    const r5 = graph.createNode({
      shape: "custom-polygon",
      attrs: {
        body: {
          refPoints: "10,0 40,0 30,20 0,20",
        },
      },
      label: "数据",
    });
    const r6 = graph.createNode({
      shape: "custom-circle",
      label: "连接",
    });
    stencil.load([r1, r2, r3, r4, r5, r6,r7], "group1");

    // const imageNodes = imageShapes.map((item) =>
    //   graph.createNode({
    //     shape: "custom-image",
    //     label: item.label,
    //     attrs: {
    //       image: {
    //         "xlink:href": item.image,
    //       },
    //     },
    //   })
    // );
    // stencil.load(imageNodes, "group2");
    // #endregion

    this.gra = graph;
  },
  methods: {
    saveParam() {
      //设置和输出参数都用prop！
      this.selectedNode.prop("attrs/data/data1", this.inputParam1);
      this.selectedNode.prop("attrs/data/data2", this.inputParam2);
      this.selectedNode.prop("attrs/data/data3", this.inputParam3);
      // 处理输入参数
      console.log("输入的参数：" + this.selectedNode.prop("attrs/data/data1"));
      console.log("输入的参数：" + this.selectedNode.prop("attrs/data/data2"));
      console.log("输入的参数：" + this.selectedNode.prop("attrs/data/data3"));
      // 关闭弹出框
      this.showModal = false;
    }
  },
};
</script>

<style>
#container {
  width: 100%;
  height: 1000px;
  display: flex;
  border: 1px solid #dfe3e8;
}

#stencil {
  width: 380px;
  height: 100%;
  position: relative;
  border-right: 1px solid #dfe3e8;
}

#graph-container {
  width: calc(100% - 380px);
  height: 100%;
}

.x6-widget-stencil {
  background-color: #fff;
}

.x6-widget-stencil-title {
  background-color: #fff;
}

.x6-widget-stencil-group-title {
  background-color: #fff !important;
}

.x6-widget-transform {
  margin: -1px 0 0 -1px;
  padding: 0px;
  border: 1px solid #239edd;
}

.x6-widget-transform > div {
  border: 1px solid #239edd;
}

.x6-widget-transform > div:hover {
  background-color: #3dafe4;
}

.x6-widget-transform-active-handle {
  background-color: #3dafe4;
}

.x6-widget-transform-resize {
  border-radius: 0;
}

.x6-widget-selection-inner {
  border: 1px solid #239edd;
}

.x6-widget-selection-box {
  opacity: 0;
}

.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 9999;
  width: 60%;
  height: auto;
  background-color: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
}

.modal-content {
  padding: 20px;
}

.close {
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
  font-size: 20px;
}
</style>
