import os
import django
import sys

# Set up django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'server.settings')
django.setup()

from app.models import CustomUser, ActiveCar, Prize, Seat, Address, Store, ItemRecord

def run():
    print("Clearing old non-superuser data...")
    CustomUser.objects.filter(is_superuser=False).delete()
    ActiveCar.objects.all().delete()
    Address.objects.all().delete()
    Store.objects.all().delete()

    print("Creating Store...")
    Store.objects.create(name='次元据点1号', address='秋叶原 1-1-1', hours='10:00 - 22:00')

    print("Creating User...")
    user1, _ = CustomUser.objects.get_or_create(username='u1', defaults={
        'first_name': '40岁勇者',
        'balance': 5000
    })
    user2, _ = CustomUser.objects.get_or_create(username='u2', defaults={
        'first_name': '欧皇',
        'balance': 1000
    })

    print("Creating Address...")
    Address.objects.create(
        user=user1,
        name='勇者基地',
        phone='13888888888',
        detail='次元节点 A-01 号',
        is_default=True
    )

    print("Creating Cars and related...")
    car201 = ActiveCar.objects.create(
        name='海贼王 - 意志的继承',
        total_seats=10,
        price=68,
        discount=100,
        description='大海贼时代的冒险！目前 50% 集结中。',
        status='open'
    )
    Prize.objects.create(car=car201, type='A', name='路飞手办', count=1, img='https://images.unsplash.com/photo-1578632292335-df3abbb0d586?w=200')
    Prize.objects.create(car=car201, type='F', name='挂件', count=9)

    # Occupied seats for car201
    Seat.objects.create(car=car201, seat_number=1, owner=user2)
    for i, name in enumerate(['非酋', '路人A', '路人B', '路人C'], start=2):
        u, _ = CustomUser.objects.get_or_create(username=f'dummy201_{i}', defaults={'first_name': name})
        Seat.objects.create(car=car201, seat_number=i, owner=u)

    car202 = ActiveCar.objects.create(
        name='火影忍者 - 羁绊之风',
        total_seats=10,
        price=58,
        discount=80,
        description='全员集结完毕，狩猎大成功！',
        status='unboxed'
    )
    pA = Prize.objects.create(car=car202, type='A', name='鸣人手办', count=1)
    pB = Prize.objects.create(car=car202, type='B', name='佐助立牌', count=1)
    pF = Prize.objects.create(car=car202, type='F', name='徽章', count=8)

    # Occupied seats for car202
    for i, seq_name in enumerate(['小李', '鹿丸', '雏田', '卡卡西', '佐井'], start=1):
        u, _ = CustomUser.objects.get_or_create(username=f'dummy202_{i}', defaults={'first_name': seq_name})
        Seat.objects.create(car=car202, seat_number=i, owner=u)
    
    Seat.objects.create(car=car202, seat_number=6, owner=user1)
    Seat.objects.create(car=car202, seat_number=8, owner=user1)
    Seat.objects.create(car=car202, seat_number=10, owner=user1)

    u_7, _ = CustomUser.objects.get_or_create(username='dummy202_7', defaults={'first_name': '自来也'})
    Seat.objects.create(car=car202, seat_number=7, owner=u_7)
    u_9, _ = CustomUser.objects.get_or_create(username='dummy202_9', defaults={'first_name': '纲手'})
    Seat.objects.create(car=car202, seat_number=9, owner=u_9)

    # Add items to user1
    ItemRecord.objects.create(user=user1, prize=pA, car=car202, seat_number=6, status='in_warehouse')
    ItemRecord.objects.create(user=user1, prize=pB, car=car202, seat_number=8, status='in_warehouse')
    ItemRecord.objects.create(user=user1, prize=pF, car=car202, seat_number=10, status='in_warehouse')

    print("Mock data successfully loaded into Django database!")

if __name__ == '__main__':
    run()
