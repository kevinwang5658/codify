#FROM docker:dind
#USER root
#RUN set -ex && apk --no-cache add sudo
#
#RUN apk add --no-cache \
#    supervisor \
#    ovmf \
#    seabios \
#    libvirt-client \
#    libvirt-daemon \
#    libvirt-common-drivers \
#    libvirt-qemu \
#    qemu-system-x86_64 \
#    qemu-audio-alsa \
#    qemu-audio-oss \
#    qemu-audio-pa \
#    qemu-audio-sdl \
#    qemu-audio-spice \
#    qemu-block-curl \
#    qemu-block-dmg-bz2 \
#    qemu-block-nfs \
#    qemu-block-ssh \
#    qemu-chardev-spice \
#    qemu-hw-display-qxl \
#    qemu-hw-display-virtio-gpu \
#    qemu-hw-display-virtio-gpu-pci \
#    qemu-hw-display-virtio-vga \
#    qemu-hw-usb-redirect \
#    qemu-img \
#    && addgroup -S mumble-server && adduser -S mumble-server -G mumble-server
#
#COPY supervisord.conf /etc/supervisord.conf
#
#VOLUME ["/var/run/libvirt/", "/var/lib/libvirt"]
#
#RUN /usr/bin/supervisord -c /etc/supervisord.conf
#
#RUN docker run -it \
#        --device /dev/kvm \
#        -p 50922:10022 \
#        -v /tmp/.X11-unix:/tmp/.X11-unix \
#        -e "DISPLAY=${DISPLAY:-:0.0}" \
#        -e GENERATE_UNIQUE=true \
#        -e MASTER_PLIST_URL='https://raw.githubusercontent.com/sickcodes/osx-serial-generator/master/config-custom.plist' \
#        sickcodes/docker-osx:monterey

FROM sickcodes/docker-osx:monterey