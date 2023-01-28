import React, { useRef, useEffect, useState } from "react";

import { IconContext } from "react-icons";
import { BsCup, BsCupStraw } from "react-icons/bs";
import { FiCoffee } from "react-icons/fi";

import * as lodash from "lodash";

import { ulid } from "ulid";

import {
  Box,
  Button,
  Center,
  Container,
  Heading,
  HStack,
  List,
  ListItem,
  Spacer,
  Stack,
  Text,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";

import { TodoTitle } from "./TodoTitle";
import { TodoAdd } from "./TodoAdd";
import { TodoList } from "./TodoList";
import { useTodo } from "../hooks/useTodo";

import * as menusData from "../apis/menus";
import { Menu } from "../model/Menu";

function App() {
  const {
    todoList,
    addTodoListItem,
    toggleTodoListItemStatus,
    deleteTodoListItem,
  } = useTodo();

  useEffect(() => {
    menusData.getAllMenus().then((menus: Menu[]) => {
      setMenuList(menus);
    });
  }, []);

  const [menuList, setMenuList] = useState<Menu[]>([]);

  const [singleMenuGachaList, setSingleMenuGachaList] = useState<Menu[]>([]);
  const [mealMenuGachaList, setMealMenuGachaList] = useState<Menu[][]>([]);

  const [totalPrice, setTotalPrice] = useState<number>();

  const handleTurnGacha = () => {
    const BUDGET_LIMIT: number = 1000;

    let total: number = 0;

    let singleMenuGachaList: Menu[] = [];
    const mealMenuGachaList: Menu[] = [];

    while (total < BUDGET_LIMIT) {
      // 残金
      const remaining = BUDGET_LIMIT - total;

      // メニューリストから、残りの金額で買えるものだけに絞る
      const purchasableMenus = [...menuList].filter(
        (menu: Menu) => menu.price <= remaining
      );

      // 残りの金額で買えるものがない
      if (!purchasableMenus.length) {
        // 単品メニューが無い場合、割引は出来ないので終了する
        if (!singleMenuGachaList.length) break;

        // 単品のフードメニューが無い場合、単品のドリンクがあるということになる。
        // 単品のドリンクが限界までリストにあるはずなので、その状態ではフードメニューを割引しても残りの金額では買えない。
        // よって、ここでは購入不可で終了する。
        if (
          ![...singleMenuGachaList].filter(
            (menu: Menu) => menu.drinkDiscount > 0
          ).length
        )
          break;

        // 単品のフードメニューから、最大の割引額を取得する（割引が無ければ終了）
        const maxDiscountFood: Menu = [...singleMenuGachaList].sort(
          (a, b) => b.drinkDiscount - a.drinkDiscount
        )[0];
        if (maxDiscountFood.drinkDiscount <= 0) break;

        // 最大の割引額を適用して、残りの金額で買えるドリンクだけに絞る
        const purchasableMenusWithDiscount = [...menuList].filter(
          (menu: Menu) =>
            menu.price - maxDiscountFood.drinkDiscount <= remaining &&
            (menu.category === "hotdrink" || menu.category === "icedrink")
        );

        // 購入できるものからランダムにドリンクを選んで追加する。
        const randomIndex = Math.floor(
          Math.random() * purchasableMenusWithDiscount.length
        );
        const purchasableDrink: Menu = lodash.cloneDeep(
          purchasableMenusWithDiscount[randomIndex]
        );
        purchasableDrink.uuid = ulid();

        // 割引して合計金額に加算
        total += purchasableDrink.price - maxDiscountFood.drinkDiscount;

        // セットメニューのリストに追加
        mealMenuGachaList.push(maxDiscountFood);
        mealMenuGachaList.push(purchasableDrink);

        // 単品メニューのリストから割引したフードを除外
        singleMenuGachaList = singleMenuGachaList.filter(
          (menu: Menu) => menu.uuid !== maxDiscountFood.uuid
        );
        break;
      }

      // 購入可能なものから、ランダムに１つ選ぶ
      const randomIndex = Math.floor(Math.random() * purchasableMenus.length);
      const gachaMenu = lodash.cloneDeep(purchasableMenus[randomIndex]);
      gachaMenu.uuid = ulid();

      // 選ばれたメニューの金額
      const price = gachaMenu.price;

      // ガチャで選ばれた単品メニューから、値引き可能なフードを取得
      const discountFoodMenu = [...singleMenuGachaList, gachaMenu].filter(
        (menu: Menu) => menu.drinkDiscount > 0
      )[0];

      // ガチャで選ばれた単品メニューから、ドリンクを取得
      const discountDrinkMenu = [...singleMenuGachaList, gachaMenu].filter(
        (menu: Menu) =>
          menu.category === "hotdrink" || menu.category === "icedrink"
      )[0];

      if (discountDrinkMenu && discountFoodMenu) {
        // 値引き可能なセットが揃っている場合、値引きを行う
        total -= discountFoodMenu.drinkDiscount;

        // セットメニューのリストに追加
        mealMenuGachaList.push(discountFoodMenu);
        mealMenuGachaList.push(discountDrinkMenu);

        // 単品メニューのリストから削除
        singleMenuGachaList = singleMenuGachaList.filter(
          (menu: Menu) =>
            menu.uuid !== discountFoodMenu.uuid &&
            menu.uuid !== discountDrinkMenu.uuid
        );
      } else {
        // セットが揃わなかったら、単品として追加
        singleMenuGachaList.push(gachaMenu);
      }

      // BUDGET_LIMIT を超える場合は終了（値引き後に判定する必要がある）
      if (total + price > BUDGET_LIMIT) break;

      // 合計金額に加算
      total += price;
    }

    setSingleMenuGachaList(singleMenuGachaList);
    setMealMenuGachaList(to2DArray(mealMenuGachaList));
    setTotalPrice(total);
  };

  const inputEl = useRef<HTMLTextAreaElement>(null);

  const handleAddTodoListItem = () => {
    const inputValue = inputEl.current?.value;
    if (!inputValue) return;

    addTodoListItem(inputValue);
    inputEl.current.value = "";
  };

  const inCompletedList = todoList.filter((todo) => {
    return !todo.done;
  });

  const completedList = todoList.filter((todo) => {
    return todo.done;
  });

  return (
    <Container centerContent p={{ base: "4", md: "6" }} maxWidth="3xl">
      {/* <TodoTitle title="TODO進捗管理" fontSize="2xl" mt="0" />

      <TodoAdd
        placeholder="ADD TODO"
        leftIcon={<AddIcon />}
        buttonText="TODOを追加"
        inputEl={inputEl}
        handleAddTodoListItem={handleAddTodoListItem}
      />

      <TodoList
        todoList={inCompletedList}
        toggleTodoListItemStatus={toggleTodoListItemStatus}
        deleteTodoListItem={deleteTodoListItem}
        title="未完了TODOリスト"
        fontSize="xl"
      />

      <TodoList
        todoList={completedList}
        toggleTodoListItemStatus={toggleTodoListItemStatus}
        deleteTodoListItem={deleteTodoListItem}
        title="完了TODOリスト"
        fontSize="xl"
      /> */}

      <>
        <Button onClick={handleTurnGacha}>ガチャを回す</Button>
        <Text>合計金額：{totalPrice}</Text>
        <List w="full">
          {mealMenuGachaList.map((menus: Menu[]) => (
            <Box bg="#F39B3B" p={4} m={4}>
              <Text fontSize="xl" color="white">
                セット -￥{menus[0].drinkDiscount}
              </Text>
              {menus.map((menu: Menu) => (
                <ListItem
                  key={menu.uuid}
                  borderWidth="1px"
                  p="4"
                  mt="4"
                  bg="white"
                  borderRadius="md"
                  borderColor="gray.300"
                >
                  <Stack>
                    <HStack>
                      <IconContext.Provider
                        value={{ color: "#999", size: "40px" }}
                      >
                        {/* <BsCupStraw /> */}
                        <FiCoffee />
                      </IconContext.Provider>
                      <Text paddingLeft={2} color="#3d2900">
                        {menu.name}
                      </Text>
                      <Spacer />
                      <Text>￥{menu.price}</Text>
                    </HStack>
                  </Stack>
                </ListItem>
              ))}
            </Box>
          ))}
        </List>
        <>
          {singleMenuGachaList.length !== 0 && (
            <List w="full">
              <Box bg="#fbd24d" p={4} m={4}>
                <Text fontSize="xl" color="white">
                  単品
                </Text>
                {singleMenuGachaList.map((menu: Menu) => (
                  <ListItem
                    key={menu.uuid}
                    borderWidth="1px"
                    p="4"
                    mt="4"
                    bg="white"
                    borderRadius="md"
                    borderColor="gray.300"
                  >
                    <Stack>
                      <HStack>
                        <Text color="#3d2900">{menu.name}</Text>
                        <Spacer />
                        <Text>￥{menu.price}</Text>
                      </HStack>
                    </Stack>
                  </ListItem>
                ))}
              </Box>
            </List>
          )}
        </>
      </>
    </Container>
  );
}

function to2DArray(arr: any[]) {
  return arr.reduce((acc, _, index) => {
    if (index % 2 === 0) {
      acc.push(arr.slice(index, index + 2));
    }
    return acc;
  }, []);
}

export default App;
